let state = {
  raw_img_list: [], // List of Dict
  filename_list: [],
  filename_list_index:0,
  raw_image_list_index:0,
  thumbnail_image_list: [],
  isMenuShown: false,
  tag_dict: [{
    label: 'Labels',
    id: -1,
    shortcut: '',
    nodes: []
  }]
}

export default state
