let state = {
  filename_list: [],

  current_raw_img: '',
  current_file_index: 0,
  current_file_name: '',

  sidebar_thumbnail_list: [],
  sidebar_filename_list: [],
  sidebar_filename_list_index: [],
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
