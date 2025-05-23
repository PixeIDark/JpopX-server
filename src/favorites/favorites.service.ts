import {
  Injectable,
  Inject,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  Pool,
  ResultSetHeader,
  RowDataPacket,
  Connection,
} from 'mysql2/promise';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Pool,
  ) {}

  async getFavoriteLists(userId: number) {
    const [lists] = await this.connection.execute<RowDataPacket[]>(
      'SELECT * FROM favorite_lists WHERE user_id = ? AND deleted_at IS NULL ORDER BY `order` ASC',
      [userId],
    );
    return lists;
  }

  async reorderList(userId: number, listId: number, newOrder: number) {
    const connection = await this.connection.getConnection();

    try {
      await connection.beginTransaction();

      // 1. 현재 order 값 확인
      const [lists] = await connection.execute<RowDataPacket[]>(
        'SELECT id, `order` FROM favorite_lists WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
        [listId, userId],
      );

      if (!lists[0]) {
        throw new ForbiddenException(
          '해당 즐겨찾기 목록에 대한 권한이 없습니다.',
        );
      }

      const currentOrder = lists[0].order;

      // 2. 최대 order 값 확인 (트랜잭션 내에서 조회)
      const [maxOrderResult] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as maxOrder FROM favorite_lists WHERE user_id = ? AND deleted_at IS NULL',
        [userId],
      );

      const maxOrder = maxOrderResult[0].maxOrder;
      const targetOrder = Math.max(1, Math.min(newOrder, maxOrder));

      // 3. 현재 위치와 목표 위치가 같으면 조기 반환
      if (currentOrder === targetOrder) {
        await connection.commit();
        return { message: '이미 해당 위치에 있습니다.' };
      }

      // 4. 재정렬 헬퍼 함수 호출
      await this.reorderItems(
        connection,
        'favorite_lists',
        'user_id',
        userId,
        listId,
        currentOrder,
        targetOrder,
        'AND deleted_at IS NULL',
      );

      await connection.commit();
      return { message: '즐겨찾기 목록 순서가 변경되었습니다.' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getFavoriteListSongs(userId: number, listId: number) {
    await this.validateListOwnership(userId, listId);

    const [songs] = await this.connection.execute<RowDataPacket[]>(
      `SELECT * FROM favorite_songs
       WHERE list_id = ?
       ORDER BY \`order\` ASC`,
      [listId],
    );

    return songs;
  }

  async createFavoriteList(userId: number, name: string) {
    const connection = await this.connection.getConnection();

    try {
      await connection.beginTransaction();

      // 1. 현재 최대 order 값 조회
      const [maxOrderResult] = await connection.execute<RowDataPacket[]>(
        'SELECT COALESCE(MAX(`order`), 0) as maxOrder FROM favorite_lists WHERE user_id = ? AND deleted_at IS NULL',
        [userId],
      );
      const maxOrder = maxOrderResult[0].maxOrder;

      // 2. 새 목록 생성 (maxOrder + 1로 추가)
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO favorite_lists (user_id, name, `order`) VALUES (?, ?, ?)',
        [userId, name, maxOrder + 1],
      );

      await connection.commit();
      return { id: result.insertId, name, order: maxOrder + 1 };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateFavoriteList(
    userId: number,
    listId: number,
    data: { name?: string; image_url?: string },
  ) {
    await this.validateListOwnership(userId, listId);

    const updateFields = [];
    const updateValues = [];

    if (data.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(data.name);
    }

    if (data.image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(data.image_url);
    }

    if (updateFields.length === 0) {
      return this.findById(listId);
    }

    const query = `
        UPDATE favorite_lists
        SET ${updateFields.join(', ')}
        WHERE id = ?
    `;

    updateValues.push(listId);

    await this.connection.execute(query, updateValues);

    return this.findById(listId);
  }

  async findById(listId: number) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM favorite_lists WHERE id = ? AND deleted_at IS NULL',
      [listId],
    );

    return rows[0];
  }

  async deleteFavoriteList(userId: number, listId: number) {
    const connection = await this.connection.getConnection();

    try {
      await connection.beginTransaction();
      await this.validateListOwnership(userId, listId);

      // 모든 곡 인기도 감소
      await this.updateMultipleSongsPopularity(connection, listId, false);

      // 목록 삭제
      await connection.execute(
        'UPDATE favorite_lists SET deleted_at = NOW() WHERE id = ?',
        [listId],
      );

      await connection.commit();
      return { message: '즐겨찾기 목록이 삭제되었습니다.' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async addSongToList(userId: number, listId: number, songId: number) {
    const connection = await this.connection.getConnection();

    try {
      await connection.beginTransaction();

      const [existing] = await connection.execute(
        `SELECT id FROM favorite_songs
         WHERE list_id = ? AND song_id = ?`,
        [listId, songId],
      );

      if (existing[0]) {
        throw new BadRequestException('이미 즐겨찾기에 추가된 노래입니다.');
      }

      // 1. 권한 체크
      await this.validateListOwnership(userId, listId);

      // 2. 곡 정보 조회
      const [songRows] = await connection.execute<RowDataPacket[]>(
        `SELECT
             s.id, s.title_ko, s.title_ja, s.title_en, s.thumbnail_url,
             a.name_ko as artist_ko, a.name_ja as artist_ja, a.name_en as artist_en,
             k.tj_number, k.kumyoung_number
         FROM songs s
                  LEFT JOIN artists a ON s.artist_id = a.id
                  LEFT JOIN karaoke_numbers k ON s.id = k.song_id
         WHERE s.id = ?`,
        [songId],
      );

      const songData = songRows[0];

      // 3. 인기도 증가
      await this.updateSongPopularity(connection, songId, true);

      // 4. 현재 최대 order 값 조회
      const [maxOrderResult] = await connection.execute<RowDataPacket[]>(
        'SELECT COALESCE(MAX(`order`), 0) as maxOrder FROM favorite_songs WHERE list_id = ?',
        [listId],
      );
      const maxOrder = maxOrderResult[0].maxOrder;

      // 5. favorite_songs에 추가
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO favorite_songs (
            list_id, song_id, title_ko, title_ja, title_en,
            artist_ko, artist_ja, artist_en, thumbnail_url,
            tj_number, kumyoung_number, \`order\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          listId,
          songId,
          songData.title_ko,
          songData.title_ja,
          songData.title_en,
          songData.artist_ko,
          songData.artist_ja,
          songData.artist_en,
          songData.thumbnail_url,
          songData.tj_number,
          songData.kumyoung_number,
          maxOrder + 1,
        ],
      );

      await connection.commit();

      return {
        favorite_id: result.insertId,
        message: '곡이 즐겨찾기에 추가되었습니다.',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async removeSongFromList(userId: number, favoriteId: number) {
    const connection = await this.connection.getConnection();

    try {
      // favorite_id로 list_id를 찾고, 권한 확인
      const [favoriteRows] = await connection.execute<RowDataPacket[]>(
        `SELECT fs.list_id, fs.order, fs.song_id
         FROM favorite_songs fs
                  INNER JOIN favorite_lists fl ON fs.list_id = fl.id
         WHERE fs.id = ? AND fl.user_id = ? AND fl.deleted_at IS NULL`,
        [favoriteId, userId],
      );

      if (!favoriteRows[0]) {
        throw new ForbiddenException(
          '해당 즐겨찾기 항목에 대한 권한이 없습니다.',
        );
      }

      const { list_id, order, song_id } = favoriteRows[0];

      await connection.beginTransaction();

      try {
        // 1. 인기도 감소
        await this.updateSongPopularity(connection, song_id, false);

        // 2. 항목 삭제
        await connection.execute('DELETE FROM favorite_songs WHERE id = ?', [
          favoriteId,
        ]);

        // 3. 뒤따르는 항목들의 order 값 감소
        await connection.execute(
          'UPDATE favorite_songs SET `order` = `order` - 1 WHERE list_id = ? AND `order` > ?',
          [list_id, order],
        );

        await connection.commit();
        return { message: '곡이 즐겨찾기에서 제거되었습니다.' };
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } finally {
      connection.release();
    }
  }

  async reorderSong(userId: number, favoriteId: number, newOrder: number) {
    const connection = await this.connection.getConnection();

    try {
      await connection.beginTransaction();

      // favorite_id로 현재 order와 list_id를 찾고, 권한 확인
      const [favorites] = await connection.execute<RowDataPacket[]>(
        `SELECT fs.id, fs.list_id, fs.order
         FROM favorite_songs fs
                  INNER JOIN favorite_lists fl ON fs.list_id = fl.id
         WHERE fs.id = ? AND fl.user_id = ? AND fl.deleted_at IS NULL`,
        [favoriteId, userId],
      );

      if (!favorites[0]) {
        throw new ForbiddenException(
          '해당 즐겨찾기 항목에 대한 권한이 없습니다.',
        );
      }

      const { list_id, order: currentOrder } = favorites[0];

      // 최대 order 값 확인 (트랜잭션 내에서 조회)
      const [maxOrderResult] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as maxOrder FROM favorite_songs WHERE list_id = ?',
        [list_id],
      );

      const maxOrder = maxOrderResult[0].maxOrder;
      const targetOrder = Math.max(1, Math.min(newOrder, maxOrder));

      // 현재 위치와 목표 위치가 같으면 조기 반환
      if (currentOrder === targetOrder) {
        await connection.commit();
        return { message: '이미 해당 위치에 있습니다.' };
      }

      // 재정렬 헬퍼 함수 호출
      await this.reorderItems(
        connection,
        'favorite_songs',
        'list_id',
        list_id,
        favoriteId,
        currentOrder,
        targetOrder,
      );

      await connection.commit();
      return { message: '곡 순서가 변경되었습니다.' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 공통 재정렬 로직을 처리하는 헬퍼 함수
  private async reorderItems(
    connection: Connection,
    tableName: string,
    conditionField: string,
    conditionValue: number,
    itemId: number,
    currentOrder: number,
    targetOrder: number,
    additionalWhere: string = '',
  ) {
    if (currentOrder < targetOrder) {
      // 위에서 아래로 이동
      await connection.execute(
        `UPDATE ${tableName} 
         SET \`order\` = \`order\` - 1 
         WHERE ${conditionField} = ? 
         AND \`order\` > ? 
         AND \`order\` <= ?
         ${additionalWhere}`,
        [conditionValue, currentOrder, targetOrder],
      );
    } else {
      // 아래에서 위로 이동
      await connection.execute(
        `UPDATE ${tableName} 
         SET \`order\` = \`order\` + 1 
         WHERE ${conditionField} = ? 
         AND \`order\` >= ? 
         AND \`order\` < ?
         ${additionalWhere}`,
        [conditionValue, targetOrder, currentOrder],
      );
    }

    // 드래그한 항목을 새 위치로 이동
    await connection.execute(
      `UPDATE ${tableName} SET \`order\` = ? WHERE id = ?`,
      [targetOrder, itemId],
    );
  }

  // 헬퍼 함수
  private async updateSongPopularity(
    connection: Connection,
    songId: number,
    increment: boolean,
  ) {
    await connection.execute(
      'UPDATE songs SET popularity_score = GREATEST(0, popularity_score + ?) WHERE id = ?',
      [increment ? 1 : -1, songId],
    );
  }

  // 헬퍼 함수
  private async updateMultipleSongsPopularity(
    connection: Connection,
    listId: number,
    increment: boolean,
  ) {
    await connection.execute(
      `UPDATE songs s
           INNER JOIN favorite_songs fs ON s.id = fs.song_id
           SET s.popularity_score = GREATEST(0, s.popularity_score + ?)
       WHERE fs.list_id = ?`,
      [increment ? 1 : -1, listId],
    );
  }

  private async validateListOwnership(userId: number, listId: number) {
    const [lists] = await this.connection.execute<RowDataPacket[]>(
      'SELECT id FROM favorite_lists WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [listId, userId],
    );

    if (!lists[0]) {
      throw new ForbiddenException(
        '해당 즐겨찾기 목록에 대한 권한이 없습니다.',
      );
    }
  }
}