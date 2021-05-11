import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useThrottle } from "./util";
import "./ui_component.css";
import { useImperativeHandle } from "react";
import cn from "classnames";
import { faSmileBeam } from "@fortawesome/free-regular-svg-icons";
import { text } from "@fortawesome/fontawesome-svg-core";

const EMPTY_O = {};
const EMPTY_FUNCTION = () => {};
const SELF_FUNCTION = (e) => e;

//handle onblur on the parent element
//https://gist.github.com/pstoica/4323d3e6e37e8a23dd59
const handleBlur = (cb) => {
  return (e) => {
    const currentTarget = e.currentTarget;

    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        if (cb instanceof Function) cb();
      }
    }, 0);
  };
};

const XSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("cursor-pointer", "rounded-full", "w-4", "h-4", "ml-2")}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ArrowSVG = ({ directionDown = true }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(
      directionDown ? "down" : "up",
      "cursor-pointer",
      "rounded-full",
      "w-4",
      "h-4",
      "ml-2",
      "m_transition"
    )}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const findOpenStateAncestor = (e) => {
  while (e) {
    if (
      e.getAttribute("data-component-ancestor") ||
      e === document.querySelector("html")
    ) {
      return e;
    }

    e = e.parentElement;
  }

  return null;
};

//registering the component itself to the closest common ancestor
//setter: state update function
//ref: any reference pointing to any element inside that component
const registerOpenStateSetter = (setter, ref) => {
  let ancestor = findOpenStateAncestor(ref.current);
  ancestor._componentOpenStateSetters ||= [];
  ancestor._componentOpenStateSetters.push(setter);
};

//once this component opens, find the ancestor and close other registered components
const closeOtherComponents = (setter, ref) => {
  let ancestor = findOpenStateAncestor(ref.current);
  ancestor._componentOpenStateSetters.forEach((_setter) => {
    if (_setter !== setter) {
      _setter(false);
    }
  });
};

const ButtonTypeStyleText = {
  disabled: {
    default: "cursor-default text-gray-400 border-gray-300",
    hover: [""],
  },
  normal: {
    default: "outline-none px-4 py-1 rounded-md text-blue-500 bg-gray-100 border-blue-500 border-2 cursor-pointer".split(
      " "
    ),
    hover: "hover:text-white hover:bg-blue-500 hover:border-transparent".split(
      " "
    ),
  },
};

export function Label({
  pos = "left",
  text = "",
  customStyle = EMPTY_O,
  children = null,
}) {
  return (
    <div
      style={customStyle}
      className={cn(
        "flex",
        "items-center",
        pos === "mid" ? "justify-center" : pos === "right" ? "justify-end" : ""
      )}
    >
      <p>{text}</p>
      {children}
    </div>
  );
}

export const Input = forwardRef(
  (
    {
      attrs,
      customStyle = EMPTY_O,
      width = "w-full",
      height = "h-10",
      placeholder = "",
      onInput = () => {},
      defaultValue = "",
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        {...attrs}
        style={customStyle}
        className={cn(
          "box-border",
          "py-1",
          "px-2",
          "rounded-sm",
          "focus:outline-none",
          height,
          width
        )}
        placeholder={placeholder}
        onInput={(e) => {
          onInput(e, e.target.value);
        }}
        defaultValue={defaultValue}
      />
    );
  }
);

export function Button({
  //common property
  disabled = false,
  text,
  disabledText = text,
  id,
  onClick = EMPTY_FUNCTION,
  customStyle = EMPTY_O,

  //style property
  buttonType = disabled ? "disabled" : "normal", // currently only normal style, other styles can be added into ButtonTypeStyleText
  hoverAnimation = true,
  overrideClass = "",
}) {
  let style = ButtonTypeStyleText[buttonType];

  return (
    <button
      className={
        overrideClass
          ? overrideClass
          : cn(style.default.concat(hoverAnimation ? style.hover : []))
      }
      onClick={onClick}
      style={customStyle}
    >
      {disabled ? disabledText : text}
    </button>
  );
}

export const MultiSelect = forwardRef(
  (
    {
      //common properties, style properties
      disabled = false,
      width = "w-full",
      height = "h-10",
      tabIndex = 0,
      customStyle = EMPTY_O,
      zIndex = "inherit",
      id,

      //component properties
      showOnHover = false,
      selections = [],
      getDesc = SELF_FUNCTION,
      onSelect,

      //controlled properties
      passiveMode = false, //when passive mode is set to true,
      allowDelete = !passiveMode, //do not allow deleting element in passive mode by default
      defaultText = "",
      controlledOpen = false,
      openState = false,
    },
    ref
  ) => {
    let [selected, setSelected] = useState([]);
    let buttonRef = useRef();
    let menuRef = useRef();
    let [menuOpen, setMenuOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      hide: () => {
        setMenuOpen(false);
      },
      clear: () => {
        setSelected([]);
      },
    }));

    useEffect(() => {
      registerOpenStateSetter(setMenuOpen, buttonRef);
    }, []);

    useEffect(() => {
      if (menuOpen) {
        closeOtherComponents(setMenuOpen, buttonRef);
      }
    }, [menuOpen]);

    useEffect(() => {
      if (passiveMode) {
        setMenuOpen(false);
        setSelected([...selections]);
      }
    }, [selections]);

    useEffect(() => {
      if (controlledOpen) {
        setMenuOpen(openState);
      }
    }, [controlledOpen, openState]);

    return (
      <div
        className={cn("multiselect", "relative", width, height)}
        tabIndex={tabIndex}
        onBlur={handleBlur(() => setMenuOpen(0))}
        onMouseLeave={() => {
          if (showOnHover) {
            setMenuOpen(0);
          }
        }}
        onMouseEnter={() => {
          if (showOnHover) {
            setMenuOpen(1);
          }
        }}
        style={{ zIndex, ...customStyle }}
      >
        <button
          id={id}
          ref={buttonRef}
          className={cn(
            "box-border",
            "pl-2",
            "w-full",
            "h-full",
            "bg-white",
            "border-2",
            "rounded-sm",
            "outline-none",
            disabled ? "" : "hover:bg-gray-200"
          )}
          onClick={() => setMenuOpen((s) => !s)}
        >
          <div className={cn("flex h-full items-center")}>
            {selected.length ? null : (
              <div className="flex items-center outline-none h-full w-full text-gray-400 text-limited">
                {defaultText}
              </div>
            )}
            <div
              className={cn(
                "h-3/4",
                "btn-mw",
                selected.length ? "" : "hidden",
                "flex",
                "justify-center",
                "items-center",
                "font-medium",
                "box-border",
                "px-2",
                "bg-white",
                "rounded-full",
                "text-blue-700",
                "border",
                "border-blue-300"
              )}
            >
              <div className="text-limited text-xs font-normal leading-none max-w-full flex-initial">
                {`(${selected.length}) ${selected.map(getDesc).join(",")}`}
              </div>
              <div
                onClick={(e) => {
                  if (allowDelete) {
                    setSelected([]);
                    onSelect([]);
                  }
                  e.stopPropagation();
                }}
                className={cn(
                  "flex",
                  "flex-auto",
                  "flex-row-reverse",
                  allowDelete ? "" : "hidden"
                )}
              >
                <XSVG />
              </div>
            </div>
            <div className={cn("ml-auto", "mr-4", passiveMode ? "hidden" : "")}>
              <ArrowSVG directionDown={!menuOpen} />
            </div>
          </div>
        </button>
        <div
          ref={menuRef}
          className={cn(
            !passiveMode && menuOpen ? "m_visible" : "m_invisible",
            "outline-none",
            "relative",
            "shadow",
            "rounded-b",
            "bg-white",
            "overflow-hidden",
            "origin-top",
            "m_transition",
            "cursor-pointer"
          )}
        >
          {selections.map((selection, i) => (
            <div
              key={selection + i}
              className={cn(
                "flex",
                "justify-start",
                "items-center",
                "box-border",
                "px-2",
                "w-full",
                "m_border",
                "leading-6",
                selected.indexOf(selection) !== -1
                  ? "bg-blue-400 text-gray-100"
                  : "hover:bg-blue-600 hover:text-gray-100 bg-white text-gray-600"
              )}
              onClick={() =>
                setSelected((all) => {
                  if (all.indexOf(selection) === -1) all.push(selection);
                  else if (allowDelete) all.splice(all.indexOf(selection), 1);
                  onSelect(all);
                  return [...all];
                })
              }
            >
              {getDesc(selection)}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export const DropDown = forwardRef(
  (
    {
      //common properties, style properties
      disabled = false,
      width = "w-full",
      height = "h-10",
      tabIndex = 0,
      hideArrow,
      id,
      zIndex = "inherit",
      customStyle = EMPTY_O,

      //component properties
      showOnHover = false,
      defaultValue = undefined, //default text dropdown without outside control
      defaultText = undefined,
      items = [],
      onSelect,
      getDesc = SELF_FUNCTION,

      //controlled properties
      controlledOpen = false,
      openState = false,
      text, //text that is given from outside, if this value is not undefined, the text shown will always be this value
      //hasControl, does not need to be specified, when text is not undefined, this value will be true, otherwise it's false

      //other functionalities
      //enable part of the options
      enabledOptionIndex = undefined,
      showDisabledOption = true,

      //add an additional input option for the user specified value
      additionalInput = false,
      additionalInputPosition = "bottom",
      additionalInputStyle = EMPTY_O,
      additionalInputPlaceholder = "",

      //add an additional option for an option which returns an empty string to onSelect by default
      blankOption = undefined, //whether or not to add an empty option which returns '' when clicked
      blankOptionOnClick = EMPTY_FUNCTION, //when onClick is bound for each item, blank option selection
    },
    ref
  ) => {
    let ulRef = useRef(null);
    let buttonRef = useRef(null);
    let inputParentRef = useRef(null);
    let inputRef = useRef(null);
    let [menuOpen, setMenuOpen] = useState(0);
    let [currentText, setCurrentText] = useState(defaultText || defaultValue);
    let allOptions = [];

    useEffect(() => {
      registerOpenStateSetter(setMenuOpen, buttonRef);
    }, []);

    useEffect(() => {
      if (menuOpen) {
        closeOtherComponents(setMenuOpen, buttonRef);
      }
    }, [menuOpen]);

    useImperativeHandle(ref, () => ({
      hide: () => {
        setMenuOpen(false);
      },
    }));

    useEffect(() => {
      if (controlledOpen) {
        setMenuOpen(openState);
      }
    }, [controlledOpen, openState]);

    if (blankOption !== undefined) {
      allOptions.push({
        name: blankOption,
        onClick() {
          if (onSelect) {
            onSelect("", -1, "select", false);
          } else {
            blankOptionOnClick("");
          }
          return false;
        },
      });
    }

    if (onSelect) {
      //items must be string array
      items = items.map((name, i) => ({
        name,
        onClick(e, triggeredByDefaultValue) {
          onSelect(name, i, "select", triggeredByDefaultValue);
          return false; // return false to close the dropdown menu
        },
      }));
    }

    allOptions = allOptions.concat(items);

    //set default value
    useEffect(() => {
      if (defaultValue) {
        for (let item of items) {
          if (item.name == defaultValue) {
            if(item.onClick){
              item.onClick(null, true);
            }
          }
        }
      }
    }, []);

    let hasControl = text === undefined; //give control to DropDown component itself

    let AdditionalInput = (
      <div
        ref={inputParentRef}
        className={cn(
          width,
          "cursor-pointer",
          "p-2",
          "flex",
          "box-border",
          "flex-row",
          "flex-nowrap",
          "justify-start",
          "items-center"
        )}
        onClick={(e) => {
          if (e.target === inputParentRef.current) {
            if (hasControl && inputRef.current) {
              setCurrentText(inputRef.current.value);
              onSelect(inputRef.current.value, null, "input");
            }

            setMenuOpen(0);
          }
        }}
      >
        <input
          style={additionalInputStyle}
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.keyCode == 13) {
              if (hasControl) {
                setCurrentText(e.target.value);
                onSelect(e.target.value, null, "input");
              }

              setMenuOpen(0);
            }
          }}
          className="cursor-auto border w-2/3 py-1 px-2 rounded-sm"
          placeholder={additionalInputPlaceholder}
        />
      </div>
    );

    return (
      <div
        className={cn(width, height, "dropdown", "group")}
        tabIndex={tabIndex}
        onBlur={handleBlur(() => setMenuOpen(0))}
        onMouseLeave={() => {
          if (showOnHover) {
            setMenuOpen(0);
          }
        }}
        onMouseEnter={() => {
          if (showOnHover) {
            setMenuOpen(1);
          }
        }}
        style={{ zIndex, ...customStyle }}
      >
        <button
          id={id}
          onClick={() => {
            setMenuOpen((s) => !s);
          }}
          ref={buttonRef}
          className={cn(
            "w-full",
            "box-border",
            "outline-none",
            "border",
            "px-2",
            "bg-white",
            "rounded-sm",
            "flex",
            "items-center",
            "self-start",
            height,
            disabled ? "" : "hover:bg-gray-200"
          )}
        >
          <span className="pr-1 text-gray-400 flex-1">
            {hasControl ? currentText : text}
          </span>
          <span className={`${hideArrow ? "hidden" : ""}`}>
            <ArrowSVG directionDown={!menuOpen} />
          </span>
        </button>

        <div
          ref={ulRef}
          className={cn(
            menuOpen ? "m_visible" : "m_invisible",
            allOptions.length ? (menuOpen ? "" : "border") : "",
            "outline-none",
            "relative",
            "shadow",
            "rounded-b",
            "overflow-hidden",
            "origin-top",
            "m_transition",
            "cursor-pointer",
            "bg-white"
          )}
        >
          {
            <>
              {additionalInput && additionalInputPosition === "top"
                ? AdditionalInput
                : ""}
              {allOptions.map((item, _index) => {
                return (
                  <div
                    key={item.name}
                    className={cn(
                      "flex",
                      "justify-start",
                      "items-center",
                      "box-border",
                      "px-2",
                      "w-full",
                      "m_border",
                      "leading-6",
                      "text-gray-600",
                      enabledOptionIndex !== undefined &&
                        enabledOptionIndex.indexOf(_index) == -1
                        ? showDisabledOption
                          ? "bg-gray-200 cursor-default text-gray-400"
                          : "hidden"
                        : "hover:bg-blue-600 hover:text-gray-100",
                      _index == allOptions.length - 1 ? "rounded-b-md" : ""
                    )}
                    onClick={(e) => {
                      let res = item.onClick(e);

                      if (hasControl) {
                        setCurrentText(item.name);
                      }

                      if (res === false) {
                        setMenuOpen((s) => !s);
                      }
                    }}
                  >
                    {getDesc(item.name)}
                  </div>
                );
              })}
              {additionalInput && additionalInputPosition === "bottom"
                ? AdditionalInput
                : ""}
            </>
          }
        </div>
      </div>
    );
  }
);
