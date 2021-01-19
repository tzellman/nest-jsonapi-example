import { AutoIncrement, Column, CreatedAt, DataType, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'photos' })
export default class Photo extends Model {
    @PrimaryKey
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    public id: string;

    @CreatedAt
    @Column({ field: 'created_at', type: DataType.DATE(3) })
    public createdAt: Date;

    @UpdatedAt
    @Column({ field: 'updated_at', type: DataType.DATE(3) })
    public updatedAt: Date;

    @Column
    public title: string;

    @Column
    public url: string;
}
