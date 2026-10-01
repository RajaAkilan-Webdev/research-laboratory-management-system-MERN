import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Experiment from "./Experiment.js";

const Reaction = sequelize.define(
  "Reaction",
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
    reactants: { type: DataTypes.TEXT, allowNull: false },
    products: { type: DataTypes.TEXT, allowNull: false },
    conditions: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  },
  { tableName: "reactions", timestamps: true, updatedAt: false },
);

Reaction.belongsTo(Experiment, {
  foreignKey: "experimentId",
  onDelete: "CASCADE",
});

export default Reaction;
