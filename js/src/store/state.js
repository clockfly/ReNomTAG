let state = {
  // error state
  error_status: '',
  // menu state
  main_menu_visible: false,

  loading_message: 'Loading images...',

  // image files
  files: [],
  filename_max_display: 0,

  // active image
  active_image_filename: null,
  active_image: {},
  active_boxid: null,

  // tag boxes
  active_image_tag_boxes: [],


  // labels
  labels: [],

  // tagged images
  tagged_images: [],
}

export default state
