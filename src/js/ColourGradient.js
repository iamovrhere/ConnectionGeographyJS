/*
 * Reference: //http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
/**
 * Used to calculate approximate colour gradients based upon the relative position 
 * of a value between the maximum and minimum values.
 * <br/>
 * (This object is still experimental)
 * <br/>
 * Colours take the form of either 6 letter hex (aa1122) to be parsed or {r:0,g:0,b:0}
 * @param {Number} minValue The value at which the minColour is represented
 * @param {Number} maxValue The value for which the maxColour is represented
 * @param {String|Object} minColour The start or minimum colour
 * @param {String|Object} maxColour The end or maximum colour.
 * @param {String|Object} midColour (Optional) The middle or 50% colour
 * If omitted, the object will attempt graduate between the two.
 * @author Jason J.
 * @version 0.2.1-20140313
 * @type ColourGradient
 */
function ColourGradient(minValue, maxValue, minColour, maxColour, midColour)  {
    /** @type Object|{r,g,b} The start colour. */
    var m_minColour = processArg(minColour);
    /** @type Object|{r,g,b} The middle colour. Sometimes null. */
    var m_midColour = midColour ? processArg(midColour) : null;
    /** @type Object|{r,g,b} The end colour. */
    var m_maxColour = processArg(maxColour);
    
    /** @type Object|{r,g,b} The amounts to shift rgb froms start towards the end. */
    var shift = {   };
    if (!m_midColour){
        /** @type Object|{r,g,b} The amounts to shift rgb froms start towards the end. */
        shift.full = configureGradientShift(m_minColour, m_maxColour);
    } else {
        /** @type Object|{r,g,b} The amounts to shift rgb towards the middle. */
        shift.one = configureGradientShift(m_minColour, m_midColour);
        /** @type Object|{r,g,b} The amounts to shift rgb towards the final goal. */
        shift.two = configureGradientShift(m_midColour, m_maxColour);
    }
    
    
    var m_minValue = minValue;
    //prevent zeroes.
    var m_maxValue = 0 === maxValue ? 0.0001 : maxValue;
    /** @type Number The difference between max and min. */
    var m_range  = maxValue - minValue;
    /** @type Number Mid-way between min & max. */
    var m_middleValue = m_maxValue - m_range/2; 
    
    ////////////////////////////////////////////////////////////////////////////
    //// functions
    ////////////////////////////////////////////////////////////////////////////
    
    /** Tests the argument to see if valid, if not throws error. 
     *  @param {Mixed} arg The argument to test.
     * @returns {Object|ColourGradient.hexToRgb.Anonym$0}
     */
    function processArg(arg){
        if (!arg.r || !arg.g || !arg.b){
            try {
                return ColourGradient.hexToRgb(arg);
            } catch (e){
                console.log('Bad argument passed: %s', arg);
            }
        }
        return arg;
    };
    /**
     * 
     * @param {Object|{r,g,b}} startColour The start colour
     * @param {Object|{r,g,b}} endColour The end colour
     * @returns {Object|{r,g,b}} Gradient in the form {r,g,b}
     */
    function configureGradientShift(startColour, endColour){
        return {
            r: startColour.r - endColour.r,
            g: startColour.g - endColour.g,
            b: startColour.b - endColour.b
        };
    };
    /** Calculates colour bases upon params passed. 
     * @param {Object} initColur The initial colour
     * @param {Object} shift Either shift one, two or full.
     * @param {Number} percent The percent for this shift
     * @param {Number} offset The offset to apply
     * @returns {Object|{r,g,b}} The colour calculated.
     */ 
    function calcColor(initColur, shift, percent, offset){
        var results = {
                        r: initColur.r + (shift.r * percent + offset) ,
                        g: initColur.g + (shift.g * percent + offset) ,
                        b: initColur.b + (shift.b * percent + offset)
                    };
        for (var k in results){
            results[k] = Math.ceil(results[k]);
            if (results[k] > 255){ results[k]= 255; }
            else if (results[k]<0){ results[k] = 0; }
        }
        return results;
    }
    /**
     * Calculates the colour to return based upon value's position between min and max.
     * @param {Number} value The value to get a colour for
     * @param {Number} min The value for which the start colour is returned
     * @param {Number} max The value for which the end colour is returned
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {Object|{r,g,b}} The colour in rgb format.
     * @throws Error If value is less than min or greater than max.     */
    function _getRgbGradient(value, min, middle, max, range, offset){
        if (value < min || value > max ){
            throw new Error('Value is not within the range of (min)%s <= (value)%s <= (max)%s',
                            min, value, max);
        }
        if (!offset){
            offset = 0;
        }
            
        switch (value){
            case min: 
                return m_minColour;
            case max:
                return m_maxColour;
            default:
                if (midColour){
                    var halfPercent = 0;
                    if (value < middle){
                        //first half.
                        halfPercent = value/middle;
                        if (halfPercent < 0.5){
                            return calcColor(m_minColour, shift.one, halfPercent, offset);
                        }//else
                        return calcColor(m_midColour, shift.one, 1-halfPercent, offset);
                        
                    } else if  (value > middle ){
                        //second half.
                        halfPercent = (value-middle)/middle;
                        if (halfPercent < 0.5){
                            return calcColor(m_midColour, shift.two, halfPercent, offset);
                        }//else
                        return calcColor(m_maxColour, shift.two, 1-halfPercent, offset);
                    } else {
                        return m_midColour;
                    }
                } else {
                    var percent = (value-min)/max;
                    if (percent < 0.5){
                        return calcColor(m_minColour, shift.full, percent, offset);
                    } 
                    return calcColor(m_maxColour, shift.full, 1-percent, offset);
                }
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Calculates the colour to return based upon value's position between min and max.
     * Optionally offsets this value.
     * @param {Number} value The value to get a colour for
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {String} The colour in hex string format. (#001122)
     * @throws Error If value is less than min or greater than max.     */
    this.getHexGradient = function(value, offset){
        var rgb = _getRgbGradient(value, m_minValue, m_middleValue, m_maxValue, m_range, offset);
        var hex = ColourGradient.rgbToHex(rgb.r, rgb.g, rgb.b);
        return hex;
    };
    /**
     * Calculates the colour to return based upon value's position between min and max.
     * Optionally offsets this value.
     * @param {Number} value The value to get a colour for
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {Object|{r,g,b}} The colour in rgb format.
     * @throws Error If value is less than min or greater than max.     */
    this.getRgbGradient = function (value, offset){
        return _getRgbGradient(value, m_minValue, m_middleValue, m_maxValue, m_range, offset);
    };
}

/** Converts r,g,b to hex.
 * @param {Number} r The red 
 * @param {Number} g The green
 * @param {Number} b The blue
 * @returns {String} The hex in the form of #001122
 */
ColourGradient.rgbToHex = function(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/** Parses the hex into r,g,b format.
 * @param {String|Number} hex attempts to parse the hex into rgb form.
 * @returns {{r,g,b}|ColourGradient.hexToRgb.Anonym$0} In the form of {r: 0, g: 0, b: }. */
ColourGradient.hexToRgb = function(hex){
    var bigint = parseInt(hex, 16);
    return {r: (bigint >> 16 & 255), g: (bigint >> 8 & 255), b: (bigint & 255)};
};