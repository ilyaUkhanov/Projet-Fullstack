import Api from "./Api.utils";

const ChallengeApi = {
  pagedList: async (pageNumber) => {
    return await Api.get(`challenges?page=${pageNumber}&size=10&sort=id,desc`);
  },
  get: async (id) => {
    return await Api.get(`challenges/${id}`);
  },
  getDetail: async (id) => {
    return await Api.get(`challenges/${id}`);
  },
};

export default ChallengeApi;
