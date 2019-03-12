import {ERROR, IMG_STATUS, NOTICE} from '@/const.js'

let state = {
  is_admin: window.location.pathname.startsWith("/admin"),
  all_image_mode: false,

  // error state
  error_status: {
    code: null,
    message: ""
  },
  notice_status: {
    code: null,
    message: ""
  },
  // img state: "No images found." or "Loading images..."
  img_status: IMG_STATUS.LOADING,

  // menu state
  main_menu_visible: false,
  working_dir: "",

  // Current User Folder Name.
  // folder: undefined,
  username: undefined,
  new_user: "user",
  user_list: [],
  
  // image files
  folder_files: {},
  tag_filter: ["notags"],
  review_filter: ["notreviewed"],
  filter_method: "NoTags",
  files: [],
  image_list: [],
  filename_max_display: 0,

  // active image
  active_image_filename: null,
  active_image: {},
  active_image_width: null,
  active_image_height: null,

  // tag boxes
  active_boxid: null,
  active_image_tag_boxes: [],
  active_image_review_result: "",
  active_image_comment_admin: "",
  active_image_comment_subord: "",
  // labels
  labels: [],

  // tagged images
  tagged_images: [],

  // label colors
  label_color: [],
  //全画面でコピーしたものを貼り付けるために追記
  pre_save_boxes_data: []
};

export default state;
