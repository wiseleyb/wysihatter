WysiHat.AdvancedToolbar = Class.create((function() {
  function initialize(editor) {
    this.editor = editor;
    this.element = this.createToolbarElement();
  }

  function createToolbarElement() {
    var toolbar = new Element('div', { 'class': 'editor_toolbar' });
    this.editor.insert({before: toolbar});
    return toolbar;
  }

  function addButtonSet(set) {
    var toolbar = this;
    $A(set).each(function(button){
      toolbar.addButton(button);
    });
  }

  function addButton(options, handler) {
    options = $H(options);

    if (!options.get('name'))
      options.set('name', options.get('label').toLowerCase());
    var name = options.get('name');

    var button = this.createButtonElement(this.element, options);

    var handler = this.buttonHandler(name, options);
    this.observeButtonClick(button, handler);

    var handler = this.buttonStateHandler(name, options);
    this.observeStateChanges(button, name, handler);
  }

  function addSelectbox(options, handler) {
    options = $H(options);

    var name = options.get('name');

    var selectbox = this.createSelectboxElement(this.element, options) ;

    var handler = this.selectboxHandler(name, options);
    this.observeOptionSelect(selectbox, handler);

    var handler = this.selectboxStateHandler(name, options);
    this.observeStateChangesSelectbox(handler);
  }

  function createButtonElement(toolbar, options) {
    var button = new Element('a', {
      'class': 'button', 'href': '#'
    });
    button.update('<span>' + options.get('label') + '</span>');
    button.addClassName(options.get('name'));
    toolbar.appendChild(button);
  
    return button;
  }

  function createSelectboxElement(toolbar, options) {
    var selectbox = Element('select', {
      'class': options.get('name')
    });
    options.get('options').each(function(option){
      element = Element('option', {
        'id' : option.toLowerCase()
      });
      element.update(option);
      selectbox.appendChild(element);
    });

    toolbar.appendChild(selectbox);

    return selectbox;
  }

  function buttonHandler(name, options) {
    if (options.handler)
      return options.handler;
    else if (options.get('handler'))
      return options.get('handler');
    else
      return function(editor) { editor.execCommand(name); };
  }

  function selectboxHandler(name, options) {
    if (options.handler)
      return options.handler;
    else if (options.get('handler'))
      return options.get('handler');
    else
      var handlers = {};
      options.get('options').each(function(option){
        var handler = function(editor) { editor.execCommand(name, false, option); };
        handlers[option] = handler;
      });
      return handlers;
  }

  function observeButtonClick(element, handler) {
    var toolbar = this;
    element.observe('click', function(event) {
      handler(toolbar.editor);
      toolbar.editor.fire("wysihat:change");
      toolbar.editor.fire("wysihat:cursormove");
      Event.stop(event);
    });
  }

  function observeOptionSelect(element, handler) {
    var toolbar = this;
    element.observe('change', function(event) {
      handler[element.value](toolbar.editor);
      toolbar.editor.fire("wysihat:change");
      toolbar.editor.fire("wysihat:cursormove");
      Event.stop(event);
    });
  }

  function buttonStateHandler(name, options) {
    if (options.query)
      return options.query;
    else if (options.get('query'))
      return options.get('query');
    else
      return function(editor) { return editor.queryCommandState(name); };
  }

  function selectboxStateHandler(name, options) {
    if (options.query)
      return options.query;
    else if (options.get('query'))
      return options.get('query');
    else
      return function(editor) { return editor.getSelectedStyles().get(name); };
  }

  function observeStateChanges(element, name, handler) {
    var toolbar = this;
    var previousState = false;
    toolbar.editor.observe("wysihat:cursormove", function(event) {
      var state = handler(toolbar.editor);
      if (state != previousState) {
        previousState = state;
        toolbar.updateButtonState(element, name, state);
      }
    });
  }

  function observeStateChangesSelectbox(handler) {
    var toolbar = this;
    var previousState = false;
    toolbar.editor.observe("wysihat:cursormove", function(event) {
      var state = handler(toolbar.editor);
      if (state != previousState) {
        previousState = state;
        toolbar.updateSelectboxState(state);
      }
    });
  }

  function updateButtonState(element, name, state) {
    if (state)
      element.addClassName('selected');
    else
      element.removeClassName('selected');
  }

  function updateSelectboxState(state) {
    $(state.toLowerCase()).selected = true;
  }

  return {
    initialize:                   initialize,
    createToolbarElement:         createToolbarElement,
    addButtonSet:                 addButtonSet,
    addButton:                    addButton,
    addSelectbox:                 addSelectbox,
    createButtonElement:          createButtonElement,
    createSelectboxElement:       createSelectboxElement,
    buttonHandler:                buttonHandler,
    selectboxHandler:             selectboxHandler,
    observeButtonClick:           observeButtonClick,
    observeOptionSelect:          observeOptionSelect,
    buttonStateHandler:           buttonStateHandler,
    observeStateChanges:          observeStateChanges,
    updateButtonState:            updateButtonState,
    updateSelectboxState:         updateSelectboxState,
    selectboxStateHandler:        selectboxStateHandler,
    observeStateChangesSelectbox: observeStateChangesSelectbox
  };
})());

WysiHat.AdvancedToolbar.ButtonSets = {};

WysiHat.AdvancedToolbar.ButtonSets.Basic = $A([
  { label: "Bold" },
  { label: "Underline" },
  { label: "Italic" }
]);
