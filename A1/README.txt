Requirements:
(a) The entire scene should fit in a window 512x512 (2 Marks).
 - main.html <canvas> tag  set width="512" and height="512"
 - allow 'size' variable to be 0.3 to make whole view fit in to 512x512 (the whole program use 'size' variable to keep every object can be sized same way even if 'size' variable change)
(b) You have to use a hierarchical approach (5 Marks).
 - Hierarchical approach has been used to Seaweed animation and Fish animation
 - Seaweed use stack to apply gRotate function in each sphere(seaweed) so next sphere can follow previous rotation while performing it's own rotation
 - The whole Fish animation follows parent rotation. Every parts of fish rotate around y-axis of origin(center of canvas) and moves up and down.
 - Tail of fish perform it's own rotaion side to side while rotating around y-axis of origin
(c) You have to use real time to synchronize your animations. (2 Marks).
 - By using provided code, I have used TIME variable to give motion of object change as time flows
(d) Ground box, 2 (Marks).
 - A simple box made by drawCude() and it's width(x-axis) and height(z-axis) are larger compare to depth(y-axis).
(e) Two rocks (spheres), (4 Marks).
 - Main rock positioned right above of ground box. Radius is '2 * size'
 - Side rock has exactly half radius of main rock and it's center located '2¡î2 * size' away from main sphere's center along x-axis
(f) Seaweed modeling: each strand has 10 ellipses. (4 Marks)
 - Seaweed has size is '1 * size' along y-axis and '0.4 * size' along x and z axis
 - By using for loop, 10 ellipses has been created
 - To avoid use of shrinking gScale(1 / (size * 0.4), 1 / size, 1 / (size * 0.4)) function before translate, I have chose to use another for loop that seperates gScale and drawSphere. Whenever gScale has been used, previous modelMatrix pop up so we don't have to use shrinking gScale function.
(g) Seaweed animation (4 Marks).
 - For seaweed animation, I have used cos function with TIME variable to change motion whenever time passes, and add another variable k to give each seaweed performs different motion at the same time.
(h) Seaweed positioning (3 strands) (3 Marks).
 - For seaweed positioning, I have set base position as '2 * radius of main sphere away from main sphere's center in x-axis and top of main sphere's position as y-axis. 
 - As the for loop goes, gTranslate function add x position with radius of main sphere so when variable i goes to 0, 1, 2, model matrix moves right along x-axis by radius of main sphere
 - As the for loop goes, gTranslate function add y position with cos function.
 - When i = 0, 'cos(0) * -radius of main sphere' makes y position set in a center of main sphere
 - When i = 1, 'cos(¥ð) * -radius of main sphere' moves y position from center to top of main sphere
 - When i = 2, 'cos(2¥ð) * -radius of main sphere' moves y position from top of main sphere to center of main sphere
(i) Fish modeling: 2 eyes with pupils, 1 head, 1 body, 2 tail fins, (6 Marks).
 - Eye has size of '0.4 * size' radius and pupil is another sphere that has half of eye's radius
 - Head has been made by drawCone() and all parameter has been set to '2 * size'
 - Body shares similar property as head but z-axis is opposite and 4 times longer than head
 - The upper fin is a cone with rotated 45 degree along x-axis of fish's body
 - The lower fin is a half length of upper fin and rotated 45 degree along x-axis in opposite direction as upper fin
(j) Fish animation: The fish must swim in a circle around the seaweed. It should always be aligned with the tangent of the circle. (4 Marks).
 - The whole fish rotate around y axis of origin, so it looks like fish swim around seawead.
 - As fish swim around seaweed, it also moves up and down. This feature has been added by using cos function with TIME variable.
 - The fin of fish rotate along x-axis of fish's body by using sin function. It looks like its swiming.
(k) You do not have to match the exact motion or dimensions of the objects shown in the sample executable. However, your scene and the sample one should be visually similar (4 Marks).
 - The motion of fish looks very similar to example.
 - The seaweed motion moves similarly to example but in my project, first seaweed also moves(example's first seaweed doesn't move).
(l) Programming style (comments, functions) (2 Marks).
(m)You have to submit a SINGLE file called <firstname-lastname>.zip (-2 Marks if you do not) that includes all the necessary files, unless the TA posts different submission instructions.
(n) You nave to include a readme.txt file that describes in full detail which of the required elements you have implemented successfully and which ones you have not. [-4 if you do not].