import {ERROR, IMG_STATUS, NOTICE} from '@/const.js'

let state = {
  // 1) Screen state
  is_admin: window.location.pathname.startsWith("/admin"),
  full_screen_mode: false,
  // menu state
  main_menu_visible: false,


  // 2) Notifications
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


  // 3) Directories
  // working_dir: the current directory where "public" exists
  // new_user: use for adding user when  "public" doesn't exists
  // user_list: all users
  working_dir: "",
  username: undefined,
  new_user: "user",
  user_list: [],

  // 4) Data in the user directory
  // folder_files:   the obj of all images stored in user's folder
  // tag_filter / eview_filter / filter_method :  the parameters for filtering images
  // filtered_imagelist:   filtered images for imagelist.vue
  folder_files: {},
  tag_filter: ["notags"],
  review_filter: ["notreviewed"],
  filter_method: "NoTags",
  filtered_imagelist: [],
  imagelist_max_display: 0,

  // 5) About the image showing now
  // active_image_filename: the filename of active_image
  // active_image: the actual image showing in tagcanvas.vue
  active_image_filename: null,
  active_image: {},
  active_image_width: null,
  active_image_height: null,


  // 6) The information of annotation boxes in a certain active_image
  // active_boxid: start from 0. They aren't fixed but move forward when the menbers are erased.
  // active_image_tag_boxes: the objects containing the information of boxes.
  active_boxid: null,
  active_image_tag_boxes: [],
  active_image_review_result: "",
  active_image_comment_admin: "",
  active_image_comment_subord: "",

  // Others)
  // labels
  labels: [],

  // annotated images
  tagged_images: [],

  // store saved-boxes from privious tagcanvas
  saved_pre_tag_boxes: []
};

export default state;
