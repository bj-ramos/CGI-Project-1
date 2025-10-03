# Features

- (1) Control Number of Points:

        Start with 60,000 points shown on the curve.

        Use ‘+’ and ‘-’ keys to increase or decrease the number of points in steps of 500.

- (2) Choose a Curve Type (Family):

        Press keys ‘1’ to ‘6’ to switch between different types of curves.

        Change Curve Shape (Coefficients):

        Let the user change the curve’s math values (coefficients) and see changes instantly on the screen.

- (3) Reset Curve to Original:

        Press ‘R’ to reset the curve to its default shape.

- (4) Move and Zoom the Curve:

        Scroll the mouse wheel to zoom in/out.

        Click and drag the curve to move it around the screen.

- (5) Animate Curve Changes:

        Press SPACE to start/stop auto animation of the curve’s parameters (only one parameter animates at a time).

        Use LEFT / RIGHT arrows to select which parameter to animate.

        Use UP / DOWN arrows to manually adjust the selected parameter or stop the animation.

- (6) Change Curve Range (t1):

        t0 is fixed at 0.

        Use PAGE UP / PAGE DOWN to increase or decrease t1, which affects how much of the curve is shown.

- (7) Switch Display Style:

        Press ‘P’ to toggle between showing just the points (5px size) or connecting them with lines.

- (8) Responsive Canvas:

        The canvas should resize automatically to fill the entire browser window.

# Specifications

- (a) Vertex Shader for Points:

        Calculate the curve points in the vertex shader (not in JavaScript).

- (b) Max Points Limit:

        You can’t use more than 60,000 points total.

- (c) Send Data to Shader:

        Pass these things to the vertex shader:

        Coefficients for the curve

        Curve family number (which type of curve it is)

        The t0 and t1 values

- (d) Keep the Aspect Ratio:

        When resizing the window or zooming, the curve should not get stretched or squished — it should keep its shape.