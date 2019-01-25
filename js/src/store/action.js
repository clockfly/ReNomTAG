import axios from "axios";
import * as utils from "@/utils";

// TODO
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

  if (response.data.undef_filename_list.length > 0) {
    let undef_message = utils.undef_filename_show(
      response.data.undef_filename_list
    );
    context.commit("set_error_status", {
      error_status: undef_message
    });
  }

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

async function load_tagged_images(context) {
  let response = await async_func(context, () =>
    axios.post(utils.build_api_url("/api/load_xml_tagged_images"), {
      folder: context.state.folder
    })
  );
  context.commit("set_tagged_images", response.data.result);
}

export default {
  async load_folder_list(context) {
    let response = await async_func(context, () =>
      axios.post(utils.build_api_url("/api/folderlist"), {
        folder: context.state.folder
      })
    );
    if (response.data.folder_list){
      context.commit("set_folder_list", {
        folder_list: response.data.folder_list
      });
    }
    else if (response.data.message){
      context.commit("set_make_dir_message",{
        make_dir_message: response.data.message
      });
      context.commit("set_working_dir",{
        working_dir: response.data.current_dir
      });
    }
  },

  async set_folder(context, folder) {
    await context.dispatch("load_folder_list");
    context.commit("set_folder", { folder: folder });
    context.commit("set_file_list", { file_list: [] });
    await load_imagefile_list(context);
    await load_label_candidates_dict(context);
    await load_tagged_images(context);
  },

  async make_dir(context) {
    let response = await async_func(context, () =>
      axios.post(utils.build_api_url("/api/make_dir"), {
        // TODO
        working_dir: context.state.working_dir,
        username: context.state.username
      })
    );
    if (response.data.message){
      context.commit("set_make_dir_message", {
        make_dir_message: response.data.message
      });
      console.log(response.data.message);
    }

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
      for (const box of response.data.boxes.annotation.objects) {
        boxes.push({
          label: box.name,
          left: box.bndbox.xmin,
          right: box.bndbox.xmax,
          top: box.bndbox.ymin,
          bottom: box.bndbox.ymax
        });
      }
    }

    let review_result = "";
    let review_comment = "";

    if (response.data.boxes) {
      review_result = response.data.boxes.annotation.source.reviewresult;
      review_comment = response.data.boxes.annotation.source.reviewcomment;
    }
    context.commit("set_active_image", {
      filename: file,
      width: response.data.width,
      height: response.data.height,
      image: "data:image;base64," + response.data.img,
      boxes,
      review_result,
      review_comment
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

// TODO
  async delete_xml(context){
    let target_filename = context.state.active_image_filename;
    let response = await async_func(context, () =>
      axios.post(utils.build_api_url("/api/delete_xml"), {
        folder: context.state.folder,
        target_filename: target_filename
      })
    );

    if (response.data.result === 0){
      console.log("result : ",response.data.message)
      context.commit("set_error_status",{
        error_status:response.data.message
      });

    }else{
    // since deliting the xml sucessed, delete the filename from state.tagged_images
      console.log("result : ",response.data.message)
      context.commit("delete_tagged_image", {
        filename: target_filename
      });

      // load next image
      let idx = 0;
      for (const file of context.state.files) {
        if (target_filename === file) {
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

      // update image data
      context.commit("update_file", {
        filename: target_filename,
        info: "reset"
      });
    }
  },


  async save_annotation(context) {

    const cur_filename = context.state.active_image_filename;
    let value = context.state.folder_files[cur_filename];

    if (!value) {
      value = {
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
    }


    value.annotation.source.reviewresult =
      context.state.active_image_review_result;
    value.annotation.source.reviewcomment =
      context.state.active_image_review_comment;

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


    const ret = await async_func(context, () =>
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

    // update image data
    context.commit("update_file", {
      filename: cur_filename,
      info: ret.data.result
    });
  },
  async delete_taglist(context, payload) {
    context.commit("set_labels", []);
    axios.post(utils.build_api_url("/api/delete_label_candidates_dict"), {
      folder: context.state.folder
    });
  }
};
