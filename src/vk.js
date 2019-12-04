const VK_IO = require("vk-io");

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
    const vk = new VK_IO.VK({ token });

    const [nothing, owner_id, item_id] = post_url.match(/wall(.+)_(.+)/);

    // TODO Get likes in loop if count > 1000
    const responseLikes = await vk.api.likes.getList({
      ...OPTIONS_LIKES_GETLIST,
      owner_id: Number(owner_id),
      item_id: Number(item_id)
    });

    console.log(responseLikes);
    const ids = responseLikes.items;

    const responseUsers = await vk.api.users.get({
      ...OPTIONS_USERS_GET,
      user_ids: ids.join(",")
    });
    console.log(responseUsers);

    return responseUsers;
  }
};

export default VK;
