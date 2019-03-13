import axios from "axios";
import * as utils from "@/utils";
import {ERROR, IMG_STATUS, NOTICE} from '@/const.js'

async function asyncFunc(context, f) {
  let ret;
  try {
    ret = await f();
  } catch (error) {
    context.commit("setErrorStatus", {
      error_status: ERROR.SERVER_CONNECTION
    });
    console.error(error);
    throw error;
  }

  return ret;
}

async function loadImagefileList(context) {
  context.commit("setImageStatus", {
    image_status: IMG_STATUS.LOADING
  });
  let response = await asyncFunc(context, () =>
    axios.post(utils.buildApiUrl("/api/get_filename_obj"), {
      username: context.state.username,
      all: false
    })
  );
  context.commit("setFolderFiles", {
    folder_files: response.data.filename_obj
  });

  if (response.data.undef_img_list.length > 0) {
    let undef_message = utils.makeMessageUndefImgList(
      response.data.undef_img_list
    );
    context.commit("setErrorStatus",{
      code: ERROR.UNDEF_FILE.code,
      message: undef_message
    });
  }

  if (response.data.dup_img_list.length > 0) {
    let dup_message = utils.makeMessageDupImgList(
      response.data.dup_img_list
    );
    context.commit("setErrorStatus",{
      code: ERROR.DUP_FILE.code,
      message: dup_message
    });
  }

  if (context.state.filtered_imagelist.length > 0) {
    context.dispatch("loadCurrentImage", context.state.filtered_imagelist[0]);
  }
}

async function loadLabelCandidatesDict(context) {
  let response = await asyncFunc(context, () =>
    axios.post(utils.buildApiUrl("/api/load_label_candidates_dict"), {
      username: context.state.username
    })
  );
  context.commit("setLabels", response.data);
}

async function loadTaggedImages(context) {
  let response = await asyncFunc(context, () =>
    axios.post(utils.buildApiUrl("/api/load_xml_tagged_images"), {
      username: context.state.username
    })
  );
  context.commit("setTaggedImages", response.data.result);
}

export default {
  async loadUserList(context) {
    let response = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/userlist"), {
        username: context.state.username
      })
    );
    if (response.data.result === 1) {
      context.commit("setUserList", {
        user_list: response.data.user_list
      });
    } else if (response.data.result === 0) {
      context.commit("setNoticeStatus", { notice_status: NOTICE.MAKE_DIR.INITIAL });
      context.commit("setWorkingDir", {
        working_dir: response.data.current_dir
      });
    }
  },

  async initClient(context, payload) {
    // "loadUserList" loads user_list.
    await context.dispatch("loadUserList");

    // "set_folder" raises error when folder is not in user_list.
    let foldername;
    if (payload) {
      foldername = payload;
    } else {
      foldername = utils.cookies.getItem("tags-foldername");
    }
    context.commit("setUsername", foldername);

    context.commit("setActiveImage", { file: null });
    context.commit("setFolderFiles", { folder_files: {} });
    context.commit("setTaggedImages", null)
    loadLabelCandidatesDict(context);
    loadImagefileList(context);
    loadTaggedImages(context);

    utils.cookies.setItem("tags-foldername", foldername, Infinity);
  },

  async makeDir(context) {
    let response = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/make_dir"), {
        working_dir: context.state.working_dir,
        username: context.state.new_user
      })
    );

    if (response.data.result !== null) {
      console.log(response.data.result);

      let {notice, error} = utils.selectMessageMakeDir(response.data.result);
      if (notice){
        context.commit("setNoticeStatus", { notice_status: notice });
        console.log("here",notice.code)
      }else if (error) {
        context.commit("setErrorStatus", { error_status: error });
        console.log("here",error.code)
      }
    }
  },

  async loadCurrentImage(context, file) {

    let response = await asyncFunc(context, () =>
      axios.get(
        utils.buildApiUrl(
          "/api/get_raw_img/" + context.state.username + "/" + file
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
    let comment_admin = "";
    let comment_subord = "";

    if (response.data.boxes) {
      review_result = response.data.boxes.annotation.source.reviewresult;
      comment_admin = response.data.boxes.annotation.source.comment.admin;
      comment_subord = response.data.boxes.annotation.source.comment.subord;
    }
    context.commit("setActiveImage", {
      filename: file,
      width: response.data.width,
      height: response.data.height,
      image: "data:image;base64," + response.data.img,
      boxes,
      review_result,
      comment_admin,
      comment_subord
    });
  },

  async addLabel(context, payload) {
    context.commit("addLabel", payload);
    await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_label_candidates_dict"), {
        username: context.state.username,
        labels: context.state.labels
      })
    );
  },

  async updateLabel(context, payload) {
    let data = payload.labels;
    for (let i = 0; i < data.length; i++) {
      if (data[i].label === payload.src[0]) {
        data[i].label = payload.dist_label;
        data[i].shortcut = payload.dist_shortcut;
      }
    }
    context.commit("setLabels", data);
    await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_label_candidates_dict"), {
        username: context.state.username,
        labels: context.state.labels
      })
    );
  },

  async deleteXml(context) {
    let target_filename = context.state.active_image_filename;
    let response = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/delete_xml"), {
        username: context.state.username,
        target_filename: target_filename
      })
    );

    if (response.data.result == ERROR.XML_DELETION.code) {
      console.log("result : ", ERROR.XML_DELETION.message);
      context.commit("setErrorStatus", {
        error_status: ERROR.XML_DELETION
      });
    } else {
      // since deliting the xml sucessed, delete the filename from state.tagged_images
      console.log("result : ", ERROR.XML_DELETION.message);
      context.commit("deleteTaggedImage", {
        filename: target_filename
      });

      // load next image
      let idx = 0;
      for (const file of context.state.filtered_imagelist) {
        if (target_filename === file) {
          break;
        }
        idx += 1;
      }

      if (idx < context.state.filtered_imagelist.length - 1) {
        idx += 1;
      } else {
        idx -= 1;
      }

      if (idx >= 0) {
        context.dispatch("loadCurrentImage", context.state.filtered_imagelist[idx]);
      } else {
        context.commit("setActiveImage", {
          filename: null,
          width: null,
          height: null,
          image: null,
          boxes: null,
          review_result: null,
          comment_admin: null,
          comment_subord: null
        });
      }

      // update image data
      context.commit("updateFolderFile", {
        filename: target_filename,
        info: "reset"
      });
    }
  },

  async saveAnnotation(context) {
    const cur_filename = context.state.active_image_filename;
    let value = context.state.folder_files[cur_filename];

    if (!value) {
      value = {
        annotation: {
          path: cur_filename,
          source: {
            database: "Unknown",
            comment: {}
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
    value.annotation.source.comment.admin =
      context.state.active_image_comment_admin;
    value.annotation.source.comment.subord =
      context.state.active_image_comment_subord;

    value.annotation.objects = [];
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

    const ret = await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_xml_from_label_dict"), {
        username: context.state.username,
        value
      })
    );

    context.commit("addTaggedImage", {
      filename: cur_filename,
      width: context.state.active_image_width,
      height: context.state.active_image_height,
      image: context.state.active_image,
      boxes: context.state.active_image_tag_boxes
    });

    // load next image
    let idx = 0;
    for (const file of context.state.filtered_imagelist) {
      if (cur_filename === file) {
        break;
      }
      idx += 1;
    }

    if (idx < context.state.filtered_imagelist.length - 1) {
      idx += 1;
    } else {
      idx -= 1;
    }

    if (idx >= 0) {
      context.dispatch("loadCurrentImage", context.state.filtered_imagelist[idx]);
    } else {
      context.commit("setActiveImage", {
        file: null
      });
    }

    // update image data
    context.commit("updateFolderFile", {
      filename: cur_filename,
      info: ret.data.result
    });
  },

  async delete_taglist(context, payload) {
    let labels = context.state.labels;
    let filtered_labels = [];
    for (let i in payload) {
      delete labels[payload[i]];
    }
    filtered_labels = labels.filter(function(x) {
      return !(x === "");
    });

    context.commit("setLabels", filtered_labels);
    await asyncFunc(context, () =>
      axios.post(utils.buildApiUrl("/api/save_label_candidates_dict"), {
        username: context.state.username,
        labels: context.state.labels
      })
    );
  }
};
