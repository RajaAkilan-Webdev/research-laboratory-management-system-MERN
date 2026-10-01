export function serializeExperiment(experiment) {
  const data = experiment.toJSON();
  if (data.researcher) {
    data.researcherId = {
      _id: data.researcher._id ?? data.researcher.id,
      name: data.researcher.name,
      email: data.researcher.email,
    };
    delete data.researcher;
  }
  return data;
}
