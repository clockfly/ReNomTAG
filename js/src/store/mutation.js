import {ERROR, IMG_STATUS, NOTICE} from '@/const.js'

function _updateTagbox(state, payload) {
  const pri = state.active_image_tag_boxes.slice(0, payload.boxid);
  const follow = state.active_image_tag_boxes.slice(payload.boxid + 1);

  state.active_image_tag_boxes = [...pri, payload.box, ...follow];
}

function selectFiles(state) {
  let tag_preds = [];
  if (state.tag_filter.indexOf("hastags") !== -1) {
    tag_preds.push(x => hasBndbox(x));
  }
  if (state.tag_filter.indexOf("notags") !== -1) {
    tag_preds.push(x => !hasBndbox(x));
  }

  let review_preds = [];
  if (state.review_filter.indexOf("ok") !== -1) {
    review_preds.push(x => getReviewResult(x) == "ok");
  }
  if (state.review_filter.indexOf("ng") !== -1) {
    review_preds.push(x => getReviewResult(x) == "ng");
  }
  if (state.review_filter.indexOf("notreviewed") !== -1) {
    review_preds.push(x => getReviewResult(x) == "notreviewed");
  }

  function any(preds, f) {
    for (let pred of preds) {
      if (pred(f)) {
        return true;
      }
    }
    return false;
  }

  const filtered_imagelist = [];
  for (let filename of Object.keys(state.folder_files)) {
    const fileinfo = state.folder_files[filename];
    if (!any(tag_preds, fileinfo)) {
      continue;
    }
    if (!any(review_preds, fileinfo)) {
      continue;
    }
    filtered_imagelist.push(filename);
  }
  filtered_imagelist.sort();
  state.filtered_imagelist = filtered_imagelist;
  if (!state.filtered_imagelist || state.filtered_imagelist.length === 0) {
    state.image_status = IMG_STATUS.NO_IMG;
  }
}

export function hasBndbox(d) {
  if (!d) {
    return false;
  }
  const ann = d.annotation;
  if (!ann) {
    return false;
  }
  const objects = ann.objects;
  if (!objects) {
    return false;
  }
  if (!objects.length) {
    return false;
  }
  return true;
}

export function getReviewResult(d) {
  if (!d) {
    return "notreviewed";
  }
  const ann = d.annotation;
  if (!ann) {
    return "notreviewed";
  }
  const source = ann.source;
  if (!source) {
    return "notreviewed";
  }
  const review = source.reviewresult;
  if (!review) {
    return "notreviewed";
  }
  return review;
}

export default {
  // 1) Screen state
  setFullScreenMode(state, payload) {
    state.full_screen_mode = payload.full_screen_mode;
  },
  setMainMenuVisible(state, payload) {
    state.main_menu_visible = payload.visible;
  },


  // 2) Notifications
  setErrorStatus(state, payload) {
    if (payload.hasOwnProperty("code")){
      state.error_status.code = payload.code;
      state.error_status.message = payload.message;
    }
    if (payload.hasOwnProperty("error_status")){
      state.error_status = payload.error_status;
    }
  },
  setNoticeStatus(state, payload) {
    if (payload.hasOwnProperty("code")){
      state.notice_status.code = payload.code;
      state.notice_status.message = payload.message;
    }
    if (payload.hasOwnProperty("notice_status")){
      state.notice_status = payload.notice_status;
    }
  },
  setImageStatus(state, payload) {
    state.image_status = payload.image_status;
  },


  // 3) Directories
  setWorkingDir(state, payload) {
    state.working_dir = payload.working_dir;
  },
  setUsername(state, payload) {
    if (state.user_list.includes(payload)) {
      state.username = payload;
    } else {
      throw new URIError("Username " + payload + " does not exist.");
    }
  },
  addNewUser(state, payload) {
     state.new_user = payload.new_user;
  },
  setUserList(state, payload) {
    state.user_list = payload.user_list;
  },



  // 4) Data in the user directory
  setFolderFiles(state, payload) {
    state.folder_files = payload.folder_files;
    state.imagelist_max_display = 100;

    selectFiles(state);
  },
  updateFolderFile(state, payload) {
    if (payload.info) {
      if (payload.info == "reset") {
        state.folder_files[payload.filename] = "";
      } else {
        state.folder_files[payload.filename] = payload.info;
      }
    } else {
      delete state.folder_files[payload.filename];
    }
    selectFiles(state);
  },
  setFilter(state, payload) {
    switch (payload) {
      case "All":
        state.tag_filter = ["hastags", "notags"];
        state.review_filter = ["ok", "ng", "notreviewed"];
        break;
      case "NeedReview":
        state.tag_filter = ["hastags"];
        state.review_filter = ["notreviewed"];
        break;
      case "NoTags":
        state.tag_filter = ["notags"];
        state.review_filter = ["notreviewed"];
        break;
      case "CHECK_OK":
        state.tag_filter = ["hastags"];
        state.review_filter = ["ok"];
        break;
      case "CHECK_NG":
        state.tag_filter = ["hastags"];
        state.review_filter = ["ng"];
        break;
      default:
        state.tag_filter = ["hastags", "notags"];
        state.review_filter = ["ok", "ng", "notreviewed"];
        break;
    }
    state.filter_method = payload;
    selectFiles(state);
  },
  setImagelistMaxDisplay(state, payload) {
    state.imagelist_max_display = payload.max_display;
  },


  // 5) About the image showing now
  setActiveImage(state, payload) {
    state.active_image_filename = payload.filename;
    state.active_image_width = payload.width;
    state.active_image_height = payload.height;
    state.active_image = payload.image;
    state.active_image_tag_boxes = payload.boxes;
    state.active_image_review_result = payload.review_result;
    state.active_image_comment_admin = payload.comment_admin;
    state.active_image_comment_subord = payload.comment_subord;

    state.active_boxid = null;
  },



  // 6) The information of annotation boxes in a certain active_image
  setActiveBoxid(state, payload) {
    state.active_boxid = payload.boxid;
  },
  setTagboxes(state, payload) {
    state.active_image_tag_boxes = payload.tagboxes;
  },
  updateTagbox(state, payload) {
    _updateTagbox(state, payload);
  },
  setActiveboxLabel(state, payload) {
    const boxid = state.active_boxid;
    if (boxid === null) {
      return;
    }
    const box = state.active_image_tag_boxes[boxid];
    const newbox = Object.assign(box, { label: payload.label });

    _updateTagbox(state, { boxid, box: newbox });
  },
  addNewTagbox(state, payload) {
    state.active_image_tag_boxes = [
      ...state.active_image_tag_boxes,
      payload.box
    ];
  },
  removeTagbox(state, payload) {
    const pri = state.active_image_tag_boxes.slice(0, payload.boxid);
    const follow = state.active_image_tag_boxes.slice(payload.boxid + 1);

    state.active_image_tag_boxes = [...pri, ...follow];
    state.active_boxid = null;
  },
  setReviewResult(state, payload) {
    if (state.is_admin) {
      state.active_image_review_result = payload.result;
    }
  },
  setCommentAdmin(state, payload) {
    state.active_image_comment_admin = payload.comment;
  },
  setCommentSubord(state, payload) {
    state.active_image_comment_subord = payload.comment;
  },


  // Others)
  setLabels(state, payload) {
    state.labels = payload;
  },
  addLabel(state, payload) {
    state.labels = [...state.labels, payload];
  },

  setTaggedImages(state, payload) {
    if (payload) {
      const imgs = payload;
      const MAX_WIDTH = 10000;
      const IMAGE_HEIGHT = 125;

      let width = 0;
      for (const img of state.tagged_images) {
        if (img.filename !== payload.filename) {
          imgs.push(img);
        }
        width += img.width * (IMAGE_HEIGHT / img.height);
        if (width > MAX_WIDTH) {
          break;
        }
      }
      state.tagged_images = imgs;
    }else{
      state.tagged_images = [];
    }
  },
  addTaggedImage(state, payload) {
    const imgs = [payload];
    const MAX_WIDTH = 10000;
    const IMAGE_HEIGHT = 125;

    let width = 0;
    for (const img of state.tagged_images) {
      if (img.filename !== payload.filename) {
        imgs.push(img);
      }
      width += img.width * (IMAGE_HEIGHT / img.height);
      if (width > MAX_WIDTH) {
        break;
      }
    }
    state.tagged_images = imgs;
  },
  deleteTaggedImage(state, payload) {
    const imgs = [];
    for (const img of state.tagged_images) {
      // push objects except the target filename
      if (img.filename !== payload.filename) {
        imgs.push(img);
      }
    }
    state.tagged_images = imgs;
  },


  setCopyBoxes(state,payload){
    state.pre_save_boxes_data = [];
    state.pre_save_boxes_data = payload;
  },
  pasteCopiedBoxes(state,payload){
    state.active_image_tag_boxes = payload;
  },
  updateBoxes(state,payload){
    state.active_image_tag_boxes = payload;
  }

  // 0) Not useing currently but maight use sometime
  //
  // toggleTagFilter(state, payload) {
  //   const idx = state.tag_filter.indexOf(payload.filter);
  //   if (idx === -1) {
  //     state.tag_filter.push(payload.filter);
  //   } else {
  //     if (state.tag_filter.length > 1) {
  //       state.tag_filter.splice(idx, 1);
  //     }
  //   }
  //   selectFiles(state);
  // },
  // toggleReviewFilter(state, payload) {
  //   const idx = state.review_filter.indexOf(payload.filter);
  //   if (idx === -1) {
  //     state.review_filter.push(payload.filter);
  //   } else {
  //     if (state.review_filter.length > 1) {
  //       state.review_filter.splice(idx, 1);
  //     }
  //   }
  //   selectFiles(state);
  // },
  // removeImage(state, payload) {
  //   const filtered_imagelist = [];
  //   for (const file of state.filtered_imagelist) {
  //     if (payload.filename !== file) {
  //       filtered_imagelist.push(file);
  //     }
  //   }
  //   state.filtered_imagelist = filtered_imagelist;
  // },
};
