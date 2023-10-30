import React, { useState } from 'react';
import interpolate from "color-interpolate";

function ToggleSliderHandle(props) {
    return (
        <div style={{ width: props.size, height: props.size, ...props }} />
    )
}


function ToggleSliderBar(props) {
    return (
        <div style={props} />
    )
}

function ToggleSlider({
    barBackgroundColor = "#c9ccd1",
    barBackgroundColorActive = "#bfdbfe",
    barBorderRadius = 16,
    barHeight = 26,
    barWidth = 48,
    handleBackgroundColor = "#ffffff",
    handleBackgroundColorActive,
    handleBorderRadius = 16,
    handleSize = 18,
    padding = 5,
    transitionDuration = "100ms",
    barTransitionDuration,
    handleTransitionDuration,
    onToggle = () => undefined,
    handleRenderer,
    handleRendererActive,
    barRenderer,
    barRendererActive,
    flip,
    barStyles,
    barStylesActive,
    handleStyles,
    handleStylesActive,
    active: initialActive = false,
    draggable = true,
    barTransitionType = "fade",
}) {

    const [active, setActive] = useState(initialActive);
    const [progress, setProgressState] = useState(((active && !flip) || (!active && flip)) ? 1 : 0);
    const [currentBarColor, setCurrentBarColor] = useState(active ? barBackgroundColorActive : barBackgroundColor);
    const [dragging, setDragging] = useState(false);

    function interpolateColors(start, end, pos) {
        const colorMap = interpolate([start, end]);
        return colorMap(pos);
    }

    function setProgress(p) {
        const paddingLeft = Math.max(padding, Math.min(barWidth - padding - handleSize, p * barWidth - handleSize / 2));
        const paddingProgress = (paddingLeft - padding) / (barWidth - padding * 2 - handleSize);
        setProgressState(p);

        if (barTransitionType === "fade") {
            setCurrentBarColor(interpolateColors(barBackgroundColor, barBackgroundColorActive, paddingProgress));
        }

    }

    const overlayStyles = {
        boxSizing: "border-box",
        width: "100%",
        flex: "none",
    };

    barStyles = active ? { ...barStyles, ...barStylesActive } : barStyles;
    handleStyles = active ? { ...handleStyles, ...handleStylesActive } : handleStyles;

    const bar = barRenderer ?? <ToggleSliderBar width={barWidth} height={barHeight}
        borderRadius={barBorderRadius}
        background={currentBarColor}
        transition={`all ${dragging ? "0s" : (barTransitionDuration ?? transitionDuration)}`}
        {...barStyles} />;
    const handle = handleRenderer ?? <ToggleSliderHandle size={handleSize}
        borderRadius={handleBorderRadius}
        backgroundColor={active ?
            (handleBackgroundColorActive ?? handleBackgroundColor) :
            handleBackgroundColor}
        transition={`all ${dragging ? "0s" : (handleTransitionDuration ?? transitionDuration)}`}
        {...handleStyles} />;
    const barActive = barRendererActive ?? bar;
    const handleActive = handleRendererActive ?? handle;

    const [down, setDown] = useState(false);

    function onPointerDown(e) {
        setDown(true);
    }

    function onPointerMove(e) {

        if (!down || !draggable) {
            return;
        }

        let localDragging = dragging;
        if (!dragging) {
            setDragging(true);
            localDragging = true;
        }

        if (localDragging) {
            const bounds = e.currentTarget.getBoundingClientRect();
            const position = (e.clientX - bounds.left) / barWidth;
            setProgress(position);
        }

    }

    function onPointerUp() {

        if (!down) {
            return;
        }

        if (!dragging) {
            onToggle(!active);
            setProgress(active ? 0 : 1);
            setActive(!active);
        } else {
            const newActive = progress > 0.5;
            onToggle(newActive);
            setProgress(newActive ? 1 : 0);
            setActive(newActive);
        }
        setDown(false);
        setDragging(false)
    }

    return (
        <div style={{ display: "flex", flexFlow: "row nowrap", cursor: "pointer", width: barWidth, userSelect: "none" }}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerUp}>
            <div style={{
                paddingTop: Math.max(handleSize - barHeight, 0) / 2, ...overlayStyles,
            }}>
                {active ? barActive : bar}
            </div>
            {barTransitionType === "slide" ? (
                <div style={{ marginLeft: "-100%", ...overlayStyles }}>
                    <div style={{
                        borderRadius: barBorderRadius,
                        width: barWidth,
                        height: barHeight,
                        marginTop: Math.max(handleSize - barHeight, 0) / 2,
                        // boxSizing: "border-box",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            transition: `all ${dragging ? "0s" : transitionDuration}`,
                            backgroundColor: barBackgroundColorActive,
                            width: progress * barWidth,
                            height: barHeight,
                        }} />
                    </div>
                </div>
            ) : undefined}
            <div style={{ marginLeft: "-100%", ...overlayStyles }}>
                <div
                    style={{
                        transition: `all ${dragging ? "0s" : transitionDuration}`,
                        paddingTop: Math.max(barHeight - handleSize, 0) / 2,
                        paddingLeft: Math.max(padding, Math.min(barWidth - padding - handleSize, progress * barWidth - handleSize / 2)),
                    }}>
                    {active ? handleActive : handle}
                </div>
            </div>
        </div>
    );
}

function useToggleSlider(props) {

    const [activeState, setActiveState] = useState(props?.active ?? false);

    function onToggle(value) {
        setActiveState(value);
    }

    return [<ToggleSlider onToggle={onToggle} {...props} />, activeState]

}

export { ToggleSlider, useToggleSlider };