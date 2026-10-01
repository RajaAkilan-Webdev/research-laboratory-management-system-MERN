import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Experiment from "./Experiment.js";

const ExperimentHistory = sequelize.define(
  "ExperimentHistory",
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
    action: { type: DataTypes.STRING, allowNull: false },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: "experimenthistories", timestamps: false },
);

ExperimentHistory.belongsTo(Experiment, {
  foreignKey: "experimentId",
  onDelete: "CASCADE",
});

export default ExperimentHistory;
