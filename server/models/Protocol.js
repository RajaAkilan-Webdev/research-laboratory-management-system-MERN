import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Experiment from "./Experiment.js";

const Protocol = sequelize.define(
  "Protocol",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("id");
      },
    },
    experimentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    steps: { type: DataTypes.TEXT, allowNull: false },
    materials: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "protocols", timestamps: true, updatedAt: false },
);

Protocol.belongsTo(Experiment, {
  foreignKey: "experimentId",
  onDelete: "CASCADE",
});

export default Protocol;
