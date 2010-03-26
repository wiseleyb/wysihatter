require 'paperclip'

module Wysihatter
  def wysihatter_sanitize(html)
    # TODO attributes => :all is pretty sloppy and might be dangerous... revist.
		Sanitize.clean(html, 
					:elements => [
			    'b', 'i', 'a', 'blockquote', 'br', 'p', 'h1', 'h2', 'h3', 'img',
			    'ul', 'li', 'ol', 'object', 'param', 'embed', 'span', 'strong', 'alt',
					'em'
			  	],
				:attributes => {
					:all => ['width', 'height', 'name', 'src', 'href', 'value', 'type', 'allowscriptaccess', 'allowfullscreen', 'style']
					}
			)
	end
end

module ActionView
  module Helpers
    module FormHelper
      def wysihatter_editor(object_name, method, options = {})
        InstanceTag.new(object_name, method, self, options.delete(:object)).to_wysihatter_editor_tag(options)
      end
    end

    class InstanceTag #:nodoc:
      def to_wysihatter_editor_tag(options = {})
        options = DEFAULT_TEXT_AREA_OPTIONS.merge(options.stringify_keys)
        add_default_name_and_id(options)

        size = options.delete("size")
        options["cols"], options["rows"] = size.split("x") if size && size.respond_to?(:split)

        if options['buttons'] == nil || options['buttons'] == :all
          buttons = [:bold, :italic, :underline, :strikethrough, 
                    :h1, :h2, :h3, :p, :justify_left, :justify_center, :justify_right, 
                    :insert_ordered_list, :insert_unordered_list, 
                    :undo, :redo, 
                    :link, :html, :image, :paste, :youtube, :vimeo, :blockquote]
        else
          buttons = options['buttons']
        end
        
        tooltips = options['tooltips'].is_a?(Hash) ? options['tooltips'].to_json : {}.to_json
        advanced_buttons = options['advanced_buttons'].is_a?(Hash) ? options['advanced_buttons'].to_json : {}.to_json
        btns = buttons.to_json
        
        #added this option to fix wyiHatify from killing ajax forms
        form_id = options['form_id'].to_s
        
        javascript = %(
        if (typeof wysihat_editors == 'undefined') var wysihat_editors = new Array();

        function loadEditor_#{tag_id}() {
          wysihat_editors['#{tag_id}'] = wysiHatify('#{tag_id}', '#{form_id}', {buttons:#{btns}, tooltips:#{tooltips}, advanced_buttons:#{advanced_buttons}});
          Event.fire(document, "wysihat:#{tag_id}:loaded");
        }
        Event.observe(window, 'load', function() { loadEditor_#{tag_id}(); });
        )

        content_tag(:script, javascript, :type => 'text/javascript') <<
        content_tag(:textarea, html_escape(options.delete('value') || value_before_type_cast(object)), options.merge(:class => 'wysihat_editor'))
      end
    end

    class FormBuilder #:nodoc:
      def wysihatter_editor(method, options = {})
        @template.wysihatter_editor(@object_name, method, options)
      end
    end
  end
end

