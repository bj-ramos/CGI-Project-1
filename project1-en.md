# Project 1 - 2D Parametric Curves
Draft version 0.92

[![IMAGE ALT TEXT'](./assets/image-01.png)](https://youtu.be/K_npEJzaMM4)

## Introduction

A 2D parametric curve is the set of 2D points $\mathbf{C}(t)$, for $t \in [t_0, t_1]$. Alternatively, we can think about the curve as two separate functions, one for each coordinate:

$$ \mathbf{C}(t) = \left\{
        \begin{array}{r}
        x(t) \\
        y(t)  \\
        \end{array}
        \right.$$

A curve can be drawn by sampling the domain for $t$ using a sequence of equidistant values $t_{0}, t_0+\delta, t0+2\delta, ... , t_1$, evaluating then to generate the sequence of points $\mathbf{C}(t_{0}), \mathbf{C}(t_0+\delta), \mathbf{C}(t0+2\delta), ... , \mathbf{C}(t_1)$ and connecting them, using straight line segments. The number of these sample points should be controlled by the user. Your application should start with 60.000 (maximum allowed) sample points and allow this number to be adjusted in steps of 500 points using keys **'+'** and **'-'**

Here is a very well known 2D parametric curve, representing a circumference of radius r, for $t \in [0, 2\pi]$:

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & r cos(t) \\
    y(t) & = & r sin(t) \\
    \end{array}
    \right.$$

A family of curves is obtained by adding additional parameters to the curve definition. A particular curve will be obtained by fixing those extra parameter values and leaving only $t$ as a variable. The circumference example before was already a family of curves: All the circumferences centered at the origin. Replacing $r$ with a specific value will result in a particular individual of that family. 

The following is another example of a family of curves:

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & cos(at) + \dfrac{cos(bt)}{2} + \dfrac{sin(ct)}{3}\\
    \\
    y(t) & = & sin(at)  + \dfrac{sin(bt)}{2} + \dfrac{cos(ct)}{3}\\
    \end{array}
    \right.$$

Setting the parameters to $a=1$, $b=2.3$ and $c=1.7$, with define the following curve belonging to that family: 

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & cos(at) + \dfrac{cos(2.3t)}{2} + \dfrac{sin(1.7t)}{3}\\
    \\
    y(t) & = & sin(at)  + \dfrac{sin(2.3t)}{2} + \dfrac{cos(1.7t)}{3}\\
    \end{array}
    \right.$$

## Objective

Build an application that draws a 2D parametric curve. The user can choose the family by pressing the keys **'1'** to **'6'**. At that point, a member of that family should be displayed. Each family may have a different number of coefficients and the manipulation of their individual values should be posssible, afecting the curve display immediately.

At any time there should be the possibility to revert the curve parameters to their original parameter values before user manipulation, using the **'R'** key.

The user should also be able to zoom in and out using the **scroll wheel** and move the curve around by clicking and dragging the mouse. The curve should move coherently with the mouse movement.

Pressing the **SPACE** key should automatically toggle the animationof  the values of the curve's family parameters. The animation should just change one single parameter and the user can select the parameter to be manipulated, one at a time, by pressing the arrow keys (**LEFT** and **RIGHT**). Pressing the **UP** and **DOWN** keys will stop the animation and increment or decrement the parameter selected.

The lower limit $t_0$ for the $t$ parameter can be fixed at 0, but the user may increase the value of $t_1$ - the upper limit - by pressing **PG UP** and **PG DOWN**.

Curves can be drawn in two different ways. Either by drawing line segments connecting the curve points or by simply drawing those points with a size of 5.0 pixels. The **'P'** key will toggle between these two display modes.

Please note that the user can resize the application window at its own will and the display area (canvas) should occupy the full area of the browser's window.

## Tecnhical Details

The curve points should be evaluated inside a vertex shader. The mandatory attributes (input) of a vertex are simply a sequence number for the sample point. A maximum of 60000 points can be used to display the curve.

The vertex shader should also receive the coefficient values for the selected curve, a number to identify the curve family and the limits for $t_0$ and $t_1$.

The application should preserve shapes and not deform them (a circle should be displayed as a circle).

## Families of curves

### Family 1

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & cos(at) + \dfrac{cos(bt)}{2} + \dfrac{sin(ct)}{3} \\
    \\
    y(t) & = & sin(at) + \dfrac{sin(bt)}{2} + \dfrac{cos(ct)}{3} \\
    \end{array}
    \right.$$

### Family 2

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & 2[cos(at) + cos^3(bt)] \\
    \\
    y(t) & = & 2[sin(at) + sin^3(bt)] \\
    \end{array}
    \right.$$

### Family 3

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & cos(at) sin(sin(at)) \\
    \\
    y(t) & = & sin(at) cos(cos(bt)) \\
    \end{array}
    \right.$$

### Family 4

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & cos(at) cos(bt) \\
    \\
    y(t) & = & sin(cos(at)) \\
    \end{array}
    \right.$$

### Family 5

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & sin(at) [e^{cos(at)} - 2 cos(bt)] \\
    \\
    y(t) & = & cos(at) [e^{cos(at)} - 2 cos(bt)] \\
    \end{array}
    \right.$$

### Family 6

$$ \left\{
    \begin{array}{rcl}
    x(t) & = & (a - b) cos(bt) + cos(at - bt) \\
    \\
    y(t) & = & (a - b) sin(bt) - sin(at - bt) \\
    \end{array}
    \right.$$


