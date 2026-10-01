import ExperimentHistory from "../models/ExperimentHistory.js";

export default function recordHistory(experimentId, action) {
  return ExperimentHistory.create({ experimentId, action });
}
