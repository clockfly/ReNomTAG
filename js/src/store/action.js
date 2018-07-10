import axios from "axios";
import * as utils from "@/utils";

async function async_func(context, f) {
  let ret;
  try {
    ret = await f();
  } catch (error) {
    context.commit("set_error_status", {
      error_status: "Failed to connect server"
    });
    console.error(error);
    throw error;
  }

  return ret;
}

async function load_imagefile_list(context) {
  context.commit("set_loading_message", {
    loading_message: "Loading images..."
  });
  let response = await async_func(context, () =>
    axios.post(utils.build_api_url("/api/get_filename_list"), {
      folder: context.state.folder,
      all: false
    })
  );

  context.commit("set_file_list", {
    file_list: response.data.filename_list
  });
  if (context.state.files.length > 0) {
    context.dispatch("load_current_image", context.state.files[0]);
  }
}

async function load_label_candidates_dict(context) {
  let response = await async_func(context, () =>
    axios.post(utils.build_api_url("/api/load_label_candidates_dict"), {
      folder: context.state.folder
    })
  );
  context.commit("set_labels", response.data);
}

export default {
  async load_folder_list(context) {
    let response = await async_func(context, () =>
      axios.post(utils.build_api_url("/api/folderlist"), {
        folder: context.state.folder
      })
    );

    context.commit("set_folder_list", {
      folder_list: response.data.folder_list
    });
  },

  async set_folder(context, folder) {
    context.commit("set_folder", { folder });
    context.commit("set_file_list", { file_list: [] });
    await load_imagefile_list(context);
    await load_label_candidates_dict(context);
  },

  async load_current_image(context, file) {
    context.commit("set_active_image", {
      file: null
    });

    let response = await async_func(context, () =>
      axios.get(
        utils.build_api_url(
          "/api/get_raw_img/" + context.state.folder + "/" + file
        )
      )
    );

    const boxes = [];
    if (response.data.boxes && response.data.boxes.annotation) {
      for (const box of response.data.boxes.annotation.object) {
        boxes.push({
          label: box.name,
          left: box.bndbox.xmin,
          right: box.bndbox.xmax,
          top: box.bndbox.ymin,
          bottom: box.bndbox.ymax
        });
      }
    }

    context.commit("set_active_image", {
      filename: file,
      width: response.data.width,
      height: response.data.height,
      image: "data:image;base64," + response.data.img,
      boxes
    });
  },

  async add_label(context, payload) {
    context.commit("add_label", payload);
    await async_func(context, () =>
      axios.post(utils.build_api_url("/api/save_label_candidates_dict"), {
        folder: context.state.folder,
        labels: context.state.labels
      })
    );
  },

  async update_label(context, payload) {
    let data = payload.labels;
    for (let i = 0; i < data.length; i++) {
      if (data[i].label === payload.src[0]) {
        data[i].label = payload.dist_label;
        data[i].shortcut = payload.dist_shortcut;
      }
    }
    context.commit("update_label", data);
    await async_func(context, () =>
      axios.post(utils.build_api_url("/api/save_label_candidates_dict"), {
        folder: context.state.folder,
        labels: context.state.labels
      })
    );
  },

  async save_annotation(context) {
    const cur_filename = context.state.active_image_filename;
    const value = {
      annotation: {
        path: cur_filename,
        source: {
          database: "Unknown"
        },
        size: {
          width: context.state.active_image_width,
          height: context.state.active_image_height,
          depth: 3
        },
        segments: 0,
        objects: []
      }
    };

    for (let box of context.state.active_image_tag_boxes) {
      let o = {
        object: {
          name: box.label,
          pose: "Unspecified",
          truncated: 0,
          difficult: 0,
          bndbox: {
            xmin: box.left,
            xmax: box.right,
            ymin: box.top,
            ymax: box.bottom
          }
        }
      };
      value.annotation.objects.push(o);
    }

    await async_func(context, () =>
      axios.post(utils.build_api_url("/api/save_xml_from_label_dict"), {
        folder: context.state.folder,
        value
      })
    );

    context.commit("add_tagged_image", {
      filename: cur_filename,
      width: context.state.active_image_width,
      height: context.state.active_image_height,
      image: context.state.active_image,
      boxes: context.state.active_image_tag_boxes
    });

    // load next image
    let idx = 0;
    for (const file of context.state.files) {
      if (cur_filename === file) {
        break;
      }
      idx += 1;
    }

    if (idx < context.state.files.length - 1) {
      idx += 1;
    } else {
      idx -= 1;
    }

    if (idx >= 0) {
      context.dispatch("load_current_image", context.state.files[idx]);
    } else {
      context.commit("set_active_image", {
        file: null
      });
    }

    // Remove image from the list.
    context.commit("remove_image", {
      filename: cur_filename
    });
  }
};
