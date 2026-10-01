import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Experiment from "./Experiment.js";

const Observation = sequelize.define(
  "Observation",
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
    observation: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: "observations", timestamps: true, updatedAt: false },
);

Observation.belongsTo(Experiment, {
  foreignKey: "experimentId",
  onDelete: "CASCADE",
});

export default Observation;
