
/*
 * jQuery selectBox Default - For selecting the default label option
 *
 * v1.0
 *
 */
;(function ($) {
     /**
     * Returns the default class of the selected option.
     *
     * @returns {String}
     */
    SelectBox.prototype.getDefaultLabelClass = function () {
        var selected = $(this.selectElement).find('OPTION:first');
        return ('selectBox-label ' + (selected.attr('class') || '')).replace(/\s+$/, '');
    };

    SelectBox.prototype.getDefaultLabelText = function () {
        var selected = $(this.selectElement).find('OPTION:first');
        return selected.text() || '\u00A0';
    };

    /**
     * Sets the label.
     * This method uses the getDefaultLabelClass() and getDefaultLabelText() methods.
     */
    SelectBox.prototype.setDefaultLabel = function () {
        var select = $(this.selectElement);
        var control = select.data('selectBox-control');
        if (!control) {
            return;
        }
        control
            .find('.selectBox-label')
            .attr('class', this.getDefaultLabelClass())
            .text(this.getDefaultLabelText());
    };

    /**
     * Extends the jQuery.fn object.
     */
    $.extend($.fn, {
        selectBoxDefault: function (method, options) {

            switch (method) {
                case 'selectDefault':
                    $(this).each(function () {
                        if (selectBoxDefault = $(this).data('selectBox')) {
                            selectBoxDefault.setDefaultLabel();
                            selectBoxDefault.setValue(options);
                        }
                    });
                    break;
                default:
                    $(this).each(function (idx, select) {
                        if (!$(select).data('selectBox')) {
                            $(select).data('selectBox', new SelectBox(select, method));
                        }
                    });
                    break;
            }
            return $(this);
        }
    });
})(jQuery);