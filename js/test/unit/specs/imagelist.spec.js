import { shallow } from 'vue-test-utils'
import { setup_store } from './utils'
import ImageList from '@/components/imagelist'

function _update_store(s) {
  s.actions.load_imagefile_list = (context)=>null;
  s.state.files = ['0', '1', '2', '3', '4', '5', '6', '7', '8', ];
  s.state.active_image_filename = '0';
  s.state.filename_max_display = 3;
}

describe('imagelist.vue', () => {
  it('click image', () => {
    const selected = []
    const store = setup_store(s=>{
      _update_store(s)
      s.actions.load_current_image = (context, file)=>selected.push(file);
    })
    const wrapper = shallow(ImageList, store)
    expect(wrapper.contains('img[data-file="0"]')).toBe(true)
    expect(wrapper.contains('img[data-file="1"]')).toBe(true)

    const l = wrapper.find('img[data-file="1"]');
    l.trigger('click');

    expect(selected.pop()).toBe('1')
  })

  it('image changed', () => {
    const store = setup_store(s=>{
      _update_store(s)
    })
    const wrapper = shallow(ImageList, store)

    const fn = jest.fn()
    wrapper.find('#imagelist').element.scrollBy = fn;
    store.store.commit('set_active_image', {
      filename: '1',
      width: 100,
      height: 200,
      image: 'image',
      boxes: []
    });

    wrapper.vm.$nextTick(()=>{
      const l = wrapper.find('#imagelist');
      l.trigger('click');

      expect(fn.mock.calls[0]).toEqual([0,0])
    })
  })

  it('scroll image', () => {
    const selected = []
    const store = setup_store(s=>{
      _update_store(s)
    })

    const wrapper = shallow(ImageList, store)
    wrapper.setData({IMAGE_RELOAD_MARGIN:5})
    const l = wrapper.find('#imagelist');
    l.trigger('scroll');

    expect(store.store.state.filename_max_display).toBe(303)
  })
    
})

