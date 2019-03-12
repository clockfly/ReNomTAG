import {ERROR, IMG_STATUS, NOTICE} from '@/const.js'

let state = {
  is_admin: window.location.pathname.startsWith("/admin"),
  full_screen_mode: false,

  // error_status: use to imform errors with modal
  error_status: {
    code: null,
    message: ""
  },
  // notice_status: use to imform notices with modal
  notice_status: {
    code: null,
    message: ""
  },
  // image state: "No images found." or "Loading images..."
  image_status: IMG_STATUS.LOADING,

  // menu state
  main_menu_visible: false,

  // working_dir: the current directory where "public" exists
  // new_user: use for adding user when  "public" doesn't exists
  // user_list: all users
  working_dir: "",
  username: undefined,
  new_user: "user",
  user_list: [],

  // folder_files:   the obj of all images stored in user's folder
  // tag_filter / eview_filter / filter_method :  the parameters for filtering images
  // filtered_imagelist:   filtered images for imagelist.vue
  folder_files: {},
  tag_filter: ["notags"],
  review_filter: ["notreviewed"],
  filter_method: "NoTags",
  filtered_imagelist: [],
  image_max_display: 0,

  // active_image_filename: the filename of active_image
  // active_image: the actual image showing in tagcanvas.vue
  active_image_filename: null,
  active_image: {},
  active_image_width: null,
  active_image_height: null,



  // The information of tag boxes for annotation.
  // Boxes in a certain active_image.

  // active_boxid: start from 0. They aren't fixed but move forward when the menbers are erased.
  // active_image_tag_boxes: the objects containing the information of boxes.
  active_boxid: null,
  active_image_tag_boxes: [],
  active_image_review_result: "",
  active_image_comment_admin: "",
  active_image_comment_subord: "",

  // labels
  labels: [],

  // annotated images
  tagged_images: [],

  // label colors
  label_color: [],
  //全画面でコピーしたものを貼り付けるために追記
  pre_save_boxes_data: []
};

export default state;
