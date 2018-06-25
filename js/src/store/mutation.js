function _set_tagbox(state, payload) {
  const pri = state.active_image_tag_boxes.slice(0, payload.boxid);
  const follow = state.active_image_tag_boxes.slice(payload.boxid + 1);

  state.active_image_tag_boxes = [...pri, payload.box, ...follow];
}

export default {
  set_error_status(state, payload) {
    state.error_status = payload.error_status;
  },

  set_loading_message(state, payload) {
    state.loading_message = payload.loading_message;
  },

  set_main_menu_visible(state, payload) {
    state.main_menu_visible = payload.visible;
  },

  set_folder_list(state, payload) {
    state.folder_list = payload.folder_list;
  },

  set_folder(state, payload) {
    state.folder = payload.folder;
  },

  set_file_list(state, payload) {
    state.files = payload.file_list;
    state.filename_max_display = 100;
    if (!state.files || state.files.length === 0) {
      state.loading_message = "No images found.";
    }
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

  add_tagged_image(state, payload) {
    const imgs = [payload];
    const MAX_WIDTH = 10000;
    const IMAGE_HEIGHT = 200;

    let width = 0;
    for (const img of state.tagged_images) {
      if (img.filename !== payload.filename) {
        imgs.push(img);
      }
      width += img.width * (img.height / IMAGE_HEIGHT);
      if (width > MAX_WIDTH) {
        break;
      }
    }
    state.tagged_images = imgs;
  }
};
