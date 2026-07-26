import { gp5 } from "../main";

/**
 * Adapted from https://github.com/LeonardoResearchGroup/NetInt/blob/master/Java/CommunityVisualizationJUNG/src/netInt/utilities/mapping/Mapper.java
 */
export class Mapper {
  // Other attributes for sigmoid filter
  private static alpha = 1;
  private static beta = 1;

  public static scalarTransforms: Record<"linear" | "log" | "sqrt", (v: number, min: number, max: number, minOut?: number, maxOut?: number) => number> = {
    linear: Mapper.linear,
    log: Mapper.log,
    sqrt: Mapper.sqrt,
  };

  // Linear mapping
  /**
   * This method linearly maps a value from one range to another.
   *
   * @param val the value to be mapped
   * @param min the minimum of the input range
   * @param max the maximum of the input range
   * @param minOut the minimum of the output range (default: 0)
   * @param maxOut the maximum of the output range (default: 1)
   * @return the mapped value
   */
  public static linear(val: number, min: number, max: number, minOut: number = 0, maxOut: number = 1): number {
    return gp5.map(val, min, max, minOut, maxOut);
  }

  // Sinusoidal mapping
  /**
   * Sinusoidal mapping.
   *
   * Maps the input numeric value from the range [min, max] into the
   * interval [PI, HALF_PI] (radians across a quarter of the circle), then
   * returns the sine of that mapped angle. Negative sine results are
   * clamped to 0 so the output is always in the range [0, 1].
   *
   * Typical use: emphasize mid-to-high values smoothly while keeping
   * outputs non-negative for visualization or weighting purposes.
   *
   * @param val - input value to map
   * @param min - minimum expected input value
   * @param max - maximum expected input value
   * @returns a number in [0,1] corresponding to sin(mappedAngle)
   */
  public static sinusoidal(val: number, min: number, max: number): number {
    // The radians are the limits of the circumference quarter to
    // be used in the filter. PI to HALF_PI is the third quarter counter
    // clockwise
    const xp = gp5.map(val, min, max, gp5.PI, gp5.HALF_PI);
    let y = gp5.sin(xp);
    if (y < 0) y = 0;
    return y;
  }

  // Radial mapping
  /**
   * This method converts the input value to a number between 0 and 1. Such
   * value is assumed as the intersection on x axis of a circle radius. Then
   * the angle of the radius is computed using the aCos() function and finally
   * the sin value of such angle is returned.
   *
   * @param val
   * @return
   */
  public static radial(val: number, min: number, max: number) {
    const xp = gp5.map(val, min, max, 1, 0);
    const angle = gp5.acos(xp);
    const y = gp5.sin(angle);
    return y;
  }

  // Sigmoid mapping
  /**
   * The interval [minOut,maxOut] determines the target range of the new
   * values. \alpha defines the width of the input intensity range, and \beta
   * defines the intensity around which the range is centered.
   * https://en.wikipedia.org/wiki/Normalization_(image_processing)
   *
   * @param val : the value to be filtered
   * @param minMax : [0] for min and [1] for max output lower bound
   * @param alpha: the width of the input intensity range
   * @param beta: the intensity around which the range is centered
   * @return
   */
  public static sigmoid(val: number, min: number, max: number, alpha: number = 1, beta: number = 1) {
    val = gp5.map(val, min, max, 255, 0);
    this.alpha = alpha;
    this.beta = beta;
    const t = Math.pow(Math.E, (val - beta) / alpha);
    const p = 1 / (1 + t);
    return p;
  }

  // Logarithmic mapping
  /**
   * Base 10 Logarithm translated to a new origin. It works as follows:
   *
   * The mapping range is translated to a new mapping start corresponding to 1
   * Thus the max value of the attribute is translated the magnitude of the
   * former min value. For instance translating the mapping range [-10, 10]
   * results in [1,20]. We do not use 0 as the min value because the logarithm
   * of 0 is Infinity, whereas the logarithm of 1 is equal to 0.
   *
   * With this new mapping range we apply the logarithm base 10 to the range [minLog, maxLog],
   * and then we map the attribute value to that range.
   *
   * @param val any number. WARNING Numbers less or equal than zero return a zero value
   * @return Returns 0 if the parameter is less or equal to zero else the Base10 logarithm
   */
  public static log(val: number, min: number, max: number): number {
    // Ensure values for logarithm are positive
    if (val <= 0) val = 1;
    let newMin = min <= 0 ? 1 : min;
    let newMax = max <= 0 ? 1 : max;

    // If range collapses, return midpoint
    if (newMin === newMax) return 0.5;

    // Map val into [newMin, newMax], then take base-10 log and map to [0,1]
    const mapped = gp5.map(val, min, max, newMin, newMax);
    const minLog = Math.log10(newMin);
    const maxLog = Math.log10(newMax);
    const vLog = Math.log10(mapped);
    return gp5.map(vLog, minLog, maxLog, 0, 1);
  }

  public static sqrt(value: number, min: number, max: number, minOut: number = 0, maxOut: number = 1) {
    return gp5.map(Math.sqrt(value), Math.sqrt(min), Math.sqrt(max), minOut, maxOut);
  }

  
}
(window as any).Mapper = Mapper;
