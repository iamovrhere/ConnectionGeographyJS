/*
 * Reference: //http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */

/**
 * Used to calculate colour gradients based upon the location of a value between
 * two values. 
 * <br/>
 * Colours take the form of either 6 letter hex (aa1122) to be parsed or {r:0,g:0,b:0}
 * @param {String|Object} minColour The start or minimum colour
 * @param {String|Object} maxColour The end or maximum colour.
 * @param {String|Object} midColour (Optional) The middle or 50% colour
 * If omitted, it will graduate between the two.
 * @author Jason J.
 * @version 0.1.0-20140312
 * @type ColourGradient
 */
function ColourGradient(minColour, maxColour, midColour)  {
    /** @type Object|{r,g,b} The start colour. */
    var m_minColour = processArg(minColour);
    /** @type Object|{r,g,b} The middle colour. Sometimes null. */
    var m_midColour = midColour ? processArg(midColour) : null;
    /** @type Object|{r,g,b} The end colour. */
    var m_maxColour = processArg(maxColour);
    
    console.log('min: %s, mid: %s, max: %s, ', 
    minColour, midColour, maxColour);
    console.log('min: %s, mid: %s, max: %s, ', 
    JSON.stringify(m_minColour), m_midColour ? JSON.stringify(m_midColour) : '', JSON.stringify(m_maxColour));
    
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
    
    console.log('shift: %s.', 
    JSON.stringify(shift));
    
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
    function _getRgbGradient(value, min, max, offset){
        if (value < min || value > max ){
            throw new Error('Value is not within the range of (min)%s <= (value)%s <= (max)%s',
                            min, value, max);
        }
        if (!offset){
            offset = 0;
        }
        //prevent zeroes.
        max = 0 === max ? 0.0001 : max;
        var range  = max - min;
        //Prevent zeroes, close enough.
        var middle = (max === range) ? max/2 : max - range/2; 
        console.log('(value %s) min: %s, middle: %s, max: %s, [range: %s] -> percent: %s %', 
            value, min, middle, max, range, (value-min)/range*100);
            
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
     * @param {Number} value The value to get a colour for
     * @param {Number} min The value for which the start colour is returned
     * @param {Number} max The value for which the end colour is returned
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {String} The colour in hex string format. (#001122)
     * @throws Error If value is less than min or greater than max.     */
    this.getHexGradient = function(value, min, max, offset){
        var rgb = _getRgbGradient(value, min, max, offset);
        var hex = ColourGradient.rgbToHex(rgb.r, rgb.g, rgb.b);
        console.log('rgb: %s hex: %s', JSON.stringify(rgb), hex);
        return hex;
    };
    /**
     * Calculates the colour to return based upon value's position between min and max.
     * @param {Number} value The value to get a colour for
     * @param {Number} min The value for which the start colour is returned
     * @param {Number} max The value for which the end colour is returned
     * @param {Number} offset (Optional). The offset to apply to make the colour darker (-ve) or
     * brighter (+ve).
     * @returns {Object|{r,g,b}} The colour in rgb format.
     * @throws Error If value is less than min or greater than max.     */
    this.getRgbGradient = function (value, min, max, offset){
        return _getRgbGradient(value, min, max, offset);
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