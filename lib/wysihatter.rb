require 'paperclip'

module Wysihatter
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
        
        #added this option to fix wyiHatify from killing ajax forms
        form_id = options['form_id'].to_s
        
        javascript = %(
        if (typeof wysihat_editors == 'undefined') var wysihat_editors = new Array();

        function loadEditor_#{tag_id}() {
          wysihat_editors['#{tag_id}'] = wysiHatify('#{tag_id}', '#{form_id}', ['#{buttons.join('\', \'')}']);
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

