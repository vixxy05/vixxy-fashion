
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Message from "./Message";

class MessageAttachment extends Model {
  public id!: number;
  public messageId!: number;
  public fileName!: string;
  public fileUrl!: string;
  public fileType!: string;
  public fileSize?: number;
  public readonly createdAt!: Date;

  public static associate() {
    this.belongsTo(Message, { foreignKey: "messageId" });
  }
}

MessageAttachment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "messages", key: "id" },
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "MessageAttachment",
    tableName: "message_attachments",
    timestamps: true,
    updatedAt: false,
  }
);

export default MessageAttachment;
