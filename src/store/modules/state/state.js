let state = {
  raw_img_list: [], // List of Dict
  filename_list: [],
  filename_list_index: 0,
  sidebar_thumbnail_list: [],
  sidebar_filename_list: [],
  isMenuShown: false,
  shortcut_label_dict_list: [], // Key: shortcut key, Value: label
  label_id_dict_list: [], // Key: label, Value: id
  tag_dict: [{
    label: 'Labels',
    id: -1,
    shortcut: '',
    nodes: []
  }]
}

export default state
