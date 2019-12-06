const VK_IO = require("vk-io");
const _ = require("lodash");

const OPTIONS_LIKES_GETLIST = {
  type: "post",
  filter: "likes",
  offset: 0,
  count: 1000,
  v: 5.103
};

const OPTIONS_USERS_GET = {
  fields: "city",
  name_case: "Nom",
  v: 5.103
};

const VK = {
  analyzePost: async (token, post_url) => {
    const MAX_VALUES = 1000;
    const vk = new VK_IO.VK({ token });
    let ids = [];

    // Get first batch of ids
    const responseLikes = await getLikes(vk, post_url);
    ids = [...responseLikes.items];

    // if users more than MAX_VALUES get another batches
    if (responseLikes.count > MAX_VALUES) {
      for (let i = 0; i < Math.floor(responseLikes.count / MAX_VALUES); i++) {
        const responseLikes = await getLikes(
          vk,
          post_url,
          (i + 1) * MAX_VALUES
        );
        ids = [...ids, ...responseLikes.items];
      }
    }

    // Filter uniq ids
    ids = _.uniq(ids);

    const responseUsers = await getUsers(vk, _.chunk(ids, MAX_VALUES));

    return responseUsers;
  }
};

async function getLikes(vk, post_url, offset = 0) {
  const [nothing, owner_id, item_id] = post_url.match(/wall(.+)_(.+)/);

  return await vk.api.likes.getList({
    ...OPTIONS_LIKES_GETLIST,
    offset,
    owner_id: Number(owner_id),
    item_id: Number(item_id)
  });
}

async function getUsers(vk, ids_chunks) {
  let responseUsers = [];

  for (let i = 0; i < ids_chunks.length; i++) {
    const response = await vk.api.users.get({
      ...OPTIONS_USERS_GET,
      user_ids: ids_chunks[i].join(",")
    });

    responseUsers = [...responseUsers, ...response];
  }

  return responseUsers;
}

export default VK;
