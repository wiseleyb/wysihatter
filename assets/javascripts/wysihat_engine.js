var editors = new Array();

var WysihatHelper = {
  // faceboxFile: function()
  // {
  //   facebox.loading();
  //   new Effect.Appear($('facebox'), {duration: 0.3});
  // 
  //   var fb  = facebox;
  //   var url = '/wysihat_files/?editor=' + this.id;
  // 
  //   new Ajax.Request(url, {
  // 		method		: 'get',
  // 		onFailure	: function(transport){
  // 			fb.reveal(transport.responseText, null);
  // 		},
  // 		onSuccess	: function(transport){
  // 			fb.reveal(transport.responseText, null);
  // 		}
  // 	});
  // },

  promptImage: function() {
     var value = prompt("Enter a URL", "http://www.google.com/intl/en_ALL/images/logo.gif")
     if(value)
       this.insertImage(value);
   },

  faceboxLink: function()
  {
    if (this.linkSelected()) {
      this.unlinkSelection();
    } else {
      facebox.loading();
      new Effect.Appear($('facebox'), {duration: 0.3});
      iframe = this;
      facebox.reveal('<input type=\"text\" id=\"link_field\" style=\"width:100%;\"/>', null);
      Event.observe('link_field', 'change', function(event) {
        iframe.linkSelection($('link_field').value);
      });
    }
  },

  faceboxHTML: function()
  {
    facebox.loading();
    new Effect.Appear($('facebox'), {duration: 0.3});
    iframe = this;
    facebox.reveal('<textarea id=\"html_editor\" style=\"width:100%; height:400px;\">' + iframe.contentWindow.document.body.innerHTML + '</textarea>', null);
    Event.observe('html_editor', 'change', function(event) {
      iframe.contentWindow.document.body.innerHTML = $('html_editor').value;
    });
  },

  faceboxPaste: function()
  {
    facebox.loading();
    new Effect.Appear($('facebox'), {duration: 0.3});
    iframe = this
    facebox.reveal('<textarea id=\"paste_editor\" style=\"width:100%; height:400px;\"></textarea>', null);         
    Event.observe('paste_editor', 'change', function(event) {
      iframe.contentWindow.document.body.innerHTML = iframe.contentWindow.document.body.innerHTML + $('paste_editor').value.escapeHTML();
    });
  },

	customButton: function(button) 
	{
		event_name = 'wysihat:' + this.textarea.id + ':' + button + ':clicked';
  	Event.fire(document, event_name);
	}
};

function wysiHatify(tag_id, form_id, buttons){
  WysiHat.Editor.include(WysihatHelper);
  var editor = WysiHat.Editor.attach(tag_id);
  var toolbar = new WysiHat.Toolbar(editor);

  editors.push(editor)
	
	if (form_id == '') {
		$$('form').each(function(f){
		  f.onsubmit = function(){
		    editors.each(function(e){
		      e.save();
		    });
		  };
		});
	} else {
		$(form_id).onsubmit = function(){
	    editors.each(function(e){
	      e.save();
	    });
		};
	}
	
	buttons.each(function(button){
		switch(button.toLowerCase()){
			case 'image':
				toolbar.addButton({label : button.gsub('_','-').camelize().capitalize(), handler: function(editor) { return editor.promptImage(editor); }});
				break;
			case 'link':
				toolbar.addButton({label : button.gsub('_','-').camelize().capitalize(), handler: function(editor) { return editor.faceboxLink(editor); }});
				break;
			case 'html':
				toolbar.addButton({label : button.gsub('_','-').camelize().capitalize(), handler: function(editor) { return editor.faceboxHTML(editor); }});
				break;
			case 'paste':
				toolbar.addButton({label : button.gsub('_','-').camelize().capitalize(), handler: function(editor) { return editor.faceboxPaste(editor); }});
				break;
		  case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': case 'p': case 'break': case 'blockquote':
			  toolbar.addButton({label : button.gsub('_','-').camelize().capitalize(), handler: function(editor) { return editor.formatblockSelection(button.toLowerCase()); }});	
				break;
			case 'bold': case 'italic': case 'underline': case 'strikethrough': case 'justify_left': 
			case 'justify_center': case 'justify_right': case 'insert_ordered_list': case 'insert_unordered_list': 
			case 'undo': case 'redo': 
				toolbar.addButton({label : button.gsub('_','-').camelize().capitalize()});
				break;
			default:
				toolbar.addButton({label : button.gsub('_','-').camelize().capitalize(), handler: function(editor) { return editor.customButton(button.toLowerCase()); }});
				break;
			//   toolbar.addButton({label : button.gsub('_','-').camelize().capitalize()});
	  }
	});
	return editor;
}
