const paginateAggregateList = async (Model, pipeline = [], matchQuery = {}, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    const skip = (page - 1) * limit;

    // Final pipeline for data
    const aggregationPipeline = [
      ...pipeline,
      { $match: matchQuery },
      { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const results = await Model.aggregate(aggregationPipeline);

    const totalRecords = await Model.countDocuments(matchQuery);

    return {
      results,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        sortBy,
        sortOrder,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { paginateAggregateList };
