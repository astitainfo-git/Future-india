
(function($) {
    var registerListeners = function() {
        $("." + this.settings.filter_class).on("click", $.proxy(doFilter, this));
    };

    var doFilter = function() {
        var filter_definitions = {};
        var element = this;
        $(element).find('.' + this.settings.filter_class).each(function(i) {
            var filter = $(this);
            if (filter.prop("checked")) {
                var attribute = filter.data(element.settings.attribute_name);
                var value = filter.data(element.settings.value_name);
                var group = filter.data(element.settings.group_name);
                var filter_string = "[data-" + attribute + "~='" + value + "']";
                if (typeof filter_definitions[group] === "undefined") {
                    filter_definitions[group] = filter_string;
                } else {
                    filter_definitions[group] += ", " + filter_string;
                }
            }
        });
        var all = $(element).find('.' + element.settings.filterable_class);
        $.each(filter_definitions, function(k, v) {
            all = $(all).filter(v);
        });

        $(element).find("." + element.settings.filterable_class).removeClass(element.settings.toggle_class_matched);
        $(element).find("." + element.settings.filterable_class).addClass(element.settings.toggle_class_nomatched);

        $(all).removeClass(element.settings.toggle_class_nomatched);
        $(all).addClass(element.settings.toggle_class_matched);
        $(element).find("#" + element.settings.debug_element_id).html(JSON.stringify(filter_definitions));
    }

    $.fn.demano = function(config) {
        var defaults = {
            filter_class: "filter",
            filterable_class: "filterable",
            attribute_name: "attribute",
            value_name: "value",
            group_name: "group",
            toggle_class_matched: "on",
            toggle_class_nomatched: "off",
            debug_element_id: null,
        };

        this.settings = $.extend(defaults, config);
        $.proxy(registerListeners, this)();
        $.proxy(doFilter, this)();
        return this;
    };
}(jQuery));