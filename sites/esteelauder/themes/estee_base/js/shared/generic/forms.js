
var generic = generic || {};

generic.forms = {
    select : {
        addOption:  function(args) {
            if (!args) return;
            var val = args.value;
            var label = args.label || val;
            var opt = '<option value="' + val + '">' + label + '</option>';

            args.menuNode.append(opt);
        },
        setValue: function(args) {
            var idx = 0;
            for (var i=0, len=args.menuNode[0].options.length; i<len; i++) {
                if (args.value == args.menuNode[0].options[i].value) {
                    idx = i;
                    break;
                }
            }
            args.menuNode[0].selectedIndex = idx;
        }
    }
};

