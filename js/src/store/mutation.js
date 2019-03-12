import {ERROR, IMG_STATUS, NOTICE} from '@/const.js'

function _set_tagbox(state, payload) {
  const pri = state.active_image_tag_boxes.slice(0, payload.boxid);
  const follow = state.active_image_tag_boxes.slice(payload.boxid + 1);

  state.active_image_tag_boxes = [...pri, payload.box, ...follow];
}

function select_files(state) {
  let tag_preds = [];
  if (state.tag_filter.indexOf("hastags") !== -1) {
    tag_preds.push(x => has_bndbox(x));
  }
  if (state.tag_filter.indexOf("notags") !== -1) {
    tag_preds.push(x => !has_bndbox(x));
  }

  let review_preds = [];
  if (state.review_filter.indexOf("ok") !== -1) {
    review_preds.push(x => get_reviewresult(x) == "ok");
  }
  if (state.review_filter.indexOf("ng") !== -1) {
    review_preds.push(x => get_reviewresult(x) == "ng");
  }
  if (state.review_filter.indexOf("notreviewed") !== -1) {
    review_preds.push(x => get_reviewresult(x) == "notreviewed");
  }

  function any(preds, f) {
    for (let pred of preds) {
      if (pred(f)) {
        return true;
      }
    }
    return false;
  }

  const files = [];
  for (let filename of Object.keys(state.folder_files)) {
    const fileinfo = state.folder_files[filename];
    if (!any(tag_preds, fileinfo)) {
      continue;
    }
    if (!any(review_preds, fileinfo)) {
      continue;
    }
    files.push(filename);
  }
  files.sort();
  state.files = files;
  if (!state.files || state.files.length === 0) {
    state.img_status = IMG_STATUS.NO_IMG;
  }
}

export function has_bndbox(d) {
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

export function get_reviewresult(d) {
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
  set_copy_boxes(state,payload){
    state.pre_save_boxes_data = [];
    state.pre_save_boxes_data = payload;
  },
  paste_copied_boxes(state,payload){
    state.active_image_tag_boxes = payload;
  },
  set_error_status(state, payload) {
    if (payload.hasOwnProperty("code")){
      state.error_status.code = payload.code;
      state.error_status.message = payload.message;
    }
    if (payload.hasOwnProperty("error_status")){
      state.error_status = payload.error_status;
    }
  },
  set_img_status(state, payload) {
    state.img_status = payload.img_status;
  },
  set_notice_status(state, payload) {
    if (payload.hasOwnProperty("code")){
      state.notice_status.code = payload.code;
      state.notice_status.message = payload.message;
    }
    if (payload.hasOwnProperty("notice_status")){
      state.notice_status = payload.notice_status;
    }
  },
  // set_username(state, payload) {
  //   state.username = payload.username;
  // },
  set_working_dir(state, payload) {
    state.working_dir = payload.working_dir;
  },
  set_main_menu_visible(state, payload) {
    state.main_menu_visible = payload.visible;
  },
  set_user_list(state, payload) {
    state.user_list = payload.user_list;
  },
  set_username(state, payload) {
    if (state.user_list.includes(payload)) {
      state.username = payload;
    } else {
      throw new URIError("Username " + payload + " does not exist.");
    }
  },
  add_new_user(state, payload) {
     state.new_user = payload.new_user;
  },
  set_all_image_mode(state, payload) {
    state.all_image_mode = payload.all_image_mode;
  },
  toggle_tag_filter(state, payload) {
    const idx = state.tag_filter.indexOf(payload.filter);
    if (idx === -1) {
      state.tag_filter.push(payload.filter);
    } else {
      if (state.tag_filter.length > 1) {
        state.tag_filter.splice(idx, 1);
      }
    }
    select_files(state);
  },
  toggle_review_filter(state, payload) {
    const idx = state.review_filter.indexOf(payload.filter);
    if (idx === -1) {
      state.review_filter.push(payload.filter);
    } else {
      if (state.review_filter.length > 1) {
        state.review_filter.splice(idx, 1);
      }
    }
    select_files(state);
  },
  set_file_list(state, payload) {
    state.folder_files = payload.file_list;
    state.filename_max_display = 100;

    select_files(state);

    if (!state.files || state.files.length === 0) {
      state.img_status = IMG_STATUS.NO_IMG;
    }
  },
  update_file(state, payload) {
    if (payload.info) {
      if (payload.info == "reset") {
        state.folder_files[payload.filename] = "";
      } else {
        state.folder_files[payload.filename] = payload.info;
      }
    } else {
      delete state.folder_files[payload.filename];
    }
    select_files(state);
  },
  set_image_list(state, payload) {
    state.image_list = payload;
  },
  set_filename_max_display(state, payload) {
    state.filename_max_display = payload.max_display;
  },
  remove_image(state, payload) {
    const files = [];
    for (const file of state.files) {
      if (payload.filename !== file) {
        files.push(file);
      }
    }
    state.files = files;
  },
  set_active_image(state, payload) {
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
  set_active_boxid(state, payload) {
    state.active_boxid = payload.boxid;
  },
  new_tagbox(state, payload) {
    state.active_image_tag_boxes = [
      ...state.active_image_tag_boxes,
      payload.box
    ];
  },
  set_tagbox(state, payload) {
    _set_tagbox(state, payload);
  },
  set_tagboxes(state, payload) {
    state.active_image_tag_boxes = payload.tagboxes;
  },
  remove_tagbox(state, payload) {
    const pri = state.active_image_tag_boxes.slice(0, payload.boxid);
    const follow = state.active_image_tag_boxes.slice(payload.boxid + 1);

    state.active_image_tag_boxes = [...pri, ...follow];
    state.active_boxid = null;
  },
  set_activebox_label(state, payload) {
    const boxid = state.active_boxid;
    if (boxid === null) {
      return;
    }
    const box = state.active_image_tag_boxes[boxid];
    const newbox = Object.assign(box, { label: payload.label });

    _set_tagbox(state, { boxid, box: newbox });
  },
  set_dragger(state, payload) {
    if (payload === null) {
      state.dragger = {};
    } else {
      state.dragger = { ...state.dragger, ...payload };
    }
  },
  add_label(state, payload) {
    state.labels = [...state.labels, payload];
  },
  set_labels(state, labels) {
    state.labels = labels;
  },
  update_label(state, payload) {
    state.labels = payload;
  },
  delete_tagged_image(state, payload) {
    const imgs = [];
    for (const img of state.tagged_images) {
      // push objects except the target filename
      if (img.filename !== payload.filename) {
        imgs.push(img);
      }
    }
    state.tagged_images = imgs;
  },
  add_tagged_image(state, payload) {
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
  set_review_result(state, payload) {
    if (state.is_admin) {
      state.active_image_review_result = payload.result;
    }
  },
  set_comment_admin(state, payload) {
    state.active_image_comment_admin = payload.comment;
  },
  set_comment_subord(state, payload) {
    state.active_image_comment_subord = payload.comment;
  },
  set_tagged_images(state, payload) {
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
  },
  set_filter(state, payload) {
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
    select_files(state);
  }
};
