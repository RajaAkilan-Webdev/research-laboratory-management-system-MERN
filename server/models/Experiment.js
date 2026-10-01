import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Experiment = sequelize.define(
  "Experiment",
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
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    researcherId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("Planned", "In Progress", "Completed"),
      allowNull: false,
      defaultValue: "Planned",
    },
    result: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  },
  {
    tableName: "experiments",
    timestamps: true,
    indexes: [{ unique: true, fields: ["researcherId", "title"] }],
  },
);

Experiment.belongsTo(User, {
  foreignKey: "researcherId",
  as: "researcher",
  onDelete: "CASCADE",
});

export default Experiment;
