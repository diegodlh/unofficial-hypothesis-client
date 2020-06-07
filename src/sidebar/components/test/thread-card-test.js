import { mount } from 'enzyme';
import { createElement } from 'preact';

import ThreadCard from '../thread-card';
import { $imports } from '../thread-card';

import { checkAccessibility } from '../../../test-util/accessibility';
import mockImportedComponents from '../../../test-util/mock-imported-components';

describe('ThreadCard', () => {
  let fakeDebounce;
  let fakeFrameSync;
  let fakeStore;
  let fakeThread;

  function createComponent(props) {
    return mount(
      <ThreadCard
        frameSync={fakeFrameSync}
        settings={{}}
        thread={fakeThread}
        {...props}
      />
    );
  }

  beforeEach(() => {
    fakeDebounce = sinon.stub().returnsArg(0);
    fakeFrameSync = {
      focusAnnotations: sinon.stub(),
      scrollToAnnotation: sinon.stub(),
    };
    fakeStore = {
      isAnnotationFocused: sinon.stub().returns(false),
      route: sinon.stub(),
    };

    fakeThread = {
      id: 't1',
      annotation: { $tag: 'myTag' },
    };

    $imports.$mock(mockImportedComponents());
    $imports.$mock({
      'lodash.debounce': fakeDebounce,
      '../store/use-store': callback => callback(fakeStore),
    });
  });

  afterEach(() => {
    $imports.$restore();
  });

  it('renders a `Thread` for the passed `thread`', () => {
    const wrapper = createComponent();
    assert(wrapper.find('Thread').props().thread === fakeThread);
  });

  it('applies a focused CSS class if the annotation thread is focused', () => {
    fakeStore.isAnnotationFocused.returns(true);

    const wrapper = createComponent();

    assert(wrapper.find('.thread-card').hasClass('is-focused'));
  });

  it('applies a CSS class if settings indicate a `clean` theme', () => {
    const wrapper = createComponent({ settings: { theme: 'clean' } });

    assert(wrapper.find('.thread-card').hasClass('thread-card--theme-clean'));
  });

  it('shows document info if current route is not sidebar', () => {
    fakeStore.route.returns('whatever');

    const wrapper = createComponent();

    assert.isTrue(wrapper.find('Thread').props().showDocumentInfo);
  });

  it('does not show document info if current route is sidebar', () => {
    fakeStore.route.returns('sidebar');

    const wrapper = createComponent();

    assert.isFalse(wrapper.find('Thread').props().showDocumentInfo);
  });

  describe('mouse and click events', () => {
    it('scrolls to the annotation when the `ThreadCard` is clicked', () => {
      const wrapper = createComponent();

      wrapper.find('.thread-card').simulate('click');

      assert.calledWith(fakeFrameSync.scrollToAnnotation, 'myTag');
    });

    it('focuses the annotation thread when mouse enters', () => {
      const wrapper = createComponent();

      wrapper.find('.thread-card').simulate('mouseenter');

      assert.calledWith(fakeFrameSync.focusAnnotations, sinon.match(['myTag']));
    });

    it('unfocuses the annotation thread when mouse exits', () => {
      const wrapper = createComponent();

      wrapper.find('.thread-card').simulate('mouseleave');

      assert.calledWith(fakeFrameSync.focusAnnotations, sinon.match([]));
    });

    ['button', 'a'].forEach(tag => {
      it(`does not scroll to the annotation if the event's target or ancestor is a ${tag}`, () => {
        const wrapper = createComponent();
        const nodeTarget = document.createElement(tag);
        const nodeChild = document.createElement('div');
        nodeTarget.appendChild(nodeChild);

        wrapper.find('.thread-card').props().onClick({
          target: nodeTarget,
        });
        wrapper.find('.thread-card').props().onClick({
          target: nodeChild,
        });
        assert.notCalled(fakeFrameSync.scrollToAnnotation);
      });
    });
  });

  it(
    'should pass a11y checks',
    checkAccessibility({
      content: () => createComponent(),
    })
  );
});
