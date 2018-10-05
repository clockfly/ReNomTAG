let state = {
  is_admin: window.location.pathname.startsWith('/admin'),
  // error state
  error_status: "",
  // menu state
  main_menu_visible: false,

  loading_message: "Loading images...",

  folder: "",
  folder_list: [],
  // image files
  folder_files: {},
  tag_filter: ['hastags','notags'],
  review_filter: ['ok','ng','notreviewed'],
  filter_method: "All",
  files: [],
  filename_max_display: 0,

  // active image
  active_image_filename: null,
  active_image: {},
  active_boxid: null,

  // tag boxes
  active_image_tag_boxes: [],
  active_image_review_result: '',
  active_image_review_comment: '',

  // labels
  labels: [],

  // tagged images
  tagged_images: [],

  // label colors
  label_color: []
};

export default state;
