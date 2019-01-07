#include <stdio.h>
#include <cstring>
#include <iostream>
#include <fstream>
#include <vector>
// Include all GLM core / GLSL features
#include <glm/glm.hpp> // vec2, vec3, mat4, radians
// Include all GLM extensions
#include <glm/ext.hpp> // perspective, translate, rotate

#define GLM_ENABLE_EXPERIMENTAL

#include <glm/gtx/intersect.hpp>

using namespace std;

bool raytracing(glm::vec3 eye, glm::vec3 ray, float *colors, int count);

void save_imageP6(int Width, int Height, char *fname, unsigned char *pixels);

void invert_matrix(double A[4][4], double Ainv[4][4]);

void adjoint(double in[4][4], double out[4][4]);

double det4x4(double m[4][4]);

double det3x3(double a1, double a2, double a3, double b1, double b2, double b3, double c1,
              double c2, double c3);

double det2x2(double a, double b, double c, double d);

struct sphere {
    glm::vec3 pos;
    glm::vec3 scale;
    glm::vec3 RGB;
    glm::vec4 K;
    int specularExp;
};

struct light {
    glm::vec3 pos;
    glm::vec3 intesity;
};

float nearPlane[5];
int resolution[2];
glm::vec3 backCol;
glm::vec3 ambInten;
vector<sphere> sphereVec;
vector<light> lightVec;
vector<glm::mat4> M_array;
vector<glm::mat4> inverse_M_array;
glm::vec3 eye(0.0f);

// This main function is meant only to illustrate how to use the save_imageXX functions.
// You should get rid of this code, and just paste the save_imageXX functions into your
// raytrace.cpp code.
int main(int argc, char **argv) {
//----------------------------------------------------------------
//-----------INPUT COLLECTING-------------------------------------
//----------------------------------------------------------------
    ifstream myReadFile;
    myReadFile.open(argv[1]);
    char output[24];
    if (myReadFile.is_open()) {
        for (int i = 0; i < 5; i++) {
            myReadFile >> output;
            myReadFile >> nearPlane[i];
        }

        myReadFile >> output;
        myReadFile >> resolution[0];
        myReadFile >> resolution[1];
        myReadFile >> output;

        string str = output;
        string strTarget = "SPHERE";
        while (str.compare(strTarget) == 0) {
            myReadFile >> output;
            struct sphere s;
            for (int i = 0; i < 3; i++)
                myReadFile >> s.pos[i];
            for (int i = 0; i < 3; i++)
                myReadFile >> s.scale[i];
            for (int i = 0; i < 3; i++)
                myReadFile >> s.RGB[i];
            for (int i = 0; i < 4; i++)
                myReadFile >> s.K[i];
            myReadFile >> s.specularExp;
            sphereVec.push_back(s);
            myReadFile >> output;
            str = output;
        }
        strTarget = "LIGHT";
        while (str.compare(strTarget) == 0) {
            myReadFile >> output;
            struct light s;
            for (int i = 0; i < 3; i++)
                myReadFile >> s.pos[i];
            for (int i = 0; i < 3; i++)
                myReadFile >> s.intesity[i];
            lightVec.push_back(s);
            myReadFile >> output;
            str = output;
        }

        for (int i = 0; i < 3; i++)
            myReadFile >> backCol[i];
        myReadFile >> output;
        for (int i = 0; i < 3; i++)
            myReadFile >> ambInten[i];
        myReadFile >> output;
        myReadFile >> output;
        cout << "Start" << endl;
        if (myReadFile.eof()) {
            cout << output << endl;
        }

        cout << "NEAR: " << nearPlane[0] << " LEFT: " << nearPlane[1] << " RIGHT: " << nearPlane[2] << " BOTTOM: "
             << nearPlane[3] << " TOP: " << nearPlane[4] << endl;
        cout << "Resolution x: " << resolution[0] << ", y: " << resolution[1] << endl;
        for (vector<int>::size_type i = 0; i < sphereVec.size(); i++) {
            cout << "" << endl;
            cout << i + 1 << "th Sphere---------------------------------" << endl;
            cout << "pos(x, y, z): " << sphereVec[i].pos[0] << ", " << sphereVec[i].pos[1] << ", "
                 << sphereVec[i].pos[2] << endl;
            cout << "scale(x, y, z): " << sphereVec[i].scale[0] << ", " << sphereVec[i].scale[1] << ", "
                 << sphereVec[i].scale[2] << endl;
            cout << "RGB(" << sphereVec[i].RGB[0] << ", " << sphereVec[i].RGB[1] << ", " << sphereVec[i].RGB[2] << ")"
                 << endl;
            cout << "K component (a: " << sphereVec[i].K[0] << ", d: " << sphereVec[i].K[1] << ", s: "
                 << sphereVec[i].K[2] << ", r: " << sphereVec[i].K[3] << ")" << endl;
            cout << "Specular Exponent n: " << sphereVec[i].specularExp << endl;
        }
        for (vector<int>::size_type i = 0; i < lightVec.size(); i++) {
            cout << "" << endl;
            cout << i + 1 << "th Light********************************" << endl;
            cout << "pos(x, y, z): " << lightVec[i].pos[0] << ", " << lightVec[i].pos[1] << ", " << lightVec[i].pos[2]
                 << endl;
            cout << "intensity(x, y, z): " << lightVec[i].intesity[0] << ", " << lightVec[i].intesity[1] << ", "
                 << lightVec[i].intesity[2] << endl;
        }
        cout << "" << endl;
        cout << "Background: " << backCol[0] << ", " << backCol[1] << ", " << backCol[2] << endl;
        cout << "Ambient: " << ambInten[0] << ", " << ambInten[1] << ", " << ambInten[2] << endl;
    }
    myReadFile.close();
//----------------------------------------------------------------
//-----------END INPUT COLLECTING---------------------------------
//----------------------------------------------------------------

//----------------------------------------------------------------
//----------------------- CREATE INVERSE--------------------------
//----------------------------------------------------------------
    for (int nSpheres = 0; nSpheres < sphereVec.size(); nSpheres++) {
        glm::mat4 translated = glm::translate(glm::mat4(1.f), sphereVec[nSpheres].pos);
        glm::mat4 scaled = glm::scale(glm::mat4(1.f), sphereVec[nSpheres].scale);
        glm::mat4 M = translated * scaled;
        M_array.push_back(M);
        glm::mat4 inverse_M;
        double tempArr1[4][4];
        double tempArr2[4][4];
        const float *pSource = glm::value_ptr(M);
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                tempArr1[i][j] = pSource[4 * i + j];
            }
        }
        invert_matrix(tempArr1, tempArr2);
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                inverse_M[i][j] = tempArr2[i][j];
            }
        }
        inverse_M_array.push_back(inverse_M);
    }
//----------------------------------------------------------------
//--------------------END CREATE INVERSE--------------------------
//----------------------------------------------------------------

//----------------------------------------------------------------
//---------------------------DRAW---------------------------------
//----------------------------------------------------------------
    unsigned char *pixels;
    // This will be your image. Note that pixels[0] is the top left of the image and
    // pixels[3*Width*Height-1] is the bottom right of the image.
    pixels = new unsigned char[3 * resolution[0] * resolution[1]];
    int k = 0;
    for (int j = resolution[1] - 1; j >= 0; j--) {
        for (int i = 0; i < resolution[0]; i++) {
            float colors[3] = {0.f};
            float uc = nearPlane[2] * (2.0f * i / resolution[0] - 1.0f);
            float vr = nearPlane[4] * (2.0f * j / resolution[1] - 1.0f);
            glm::vec3 eye(uc, vr, -nearPlane[0]);
            glm::vec3 ray = glm::normalize(eye);
            raytracing(eye, ray, colors, 1);
            for (int z = 0; z < 3; z++) {
                if (colors[z] > 1.f)
                    colors[z] = 1.f;
                pixels[k++] = colors[z] * 255;
            }
        }
    }
    save_imageP6(resolution[0], resolution[1], output, pixels);
//----------------------------------------------------------------
//-----------------------END DRAW---------------------------------
//----------------------------------------------------------------
    return 0;
}

//----------------------------------------------------------------
//----------------------RAYTRACING--------------------------------
//----------------------------------------------------------------
bool raytracing(glm::vec3 eye, glm::vec3 ray, float *colors, int count) {
    // Exit when more than 3 rays
    if (count > 3)
        return false;

    glm::vec3 intersectionPosition;
    glm::vec3 intersectionNormal;
    glm::vec3 realIntersectPosition;
    glm::vec3 realIntersectNormal;
    glm::vec3 inverseEye;
    glm::vec3 inverseRay;

    bool hasReflect;
    bool hasIntersect = false;
    int closestSphere = 0;
    float distances[sphereVec.size()];

    // For every sphere, ray and eye inverse to find intersection
    for (int nSpheres = 0; nSpheres < sphereVec.size(); nSpheres++) {
        inverseEye = glm::vec3(inverse_M_array[nSpheres] * glm::vec4(eye, 1.f));
        inverseRay = glm::normalize(glm::vec3(inverse_M_array[nSpheres] * glm::vec4(ray, 0.f)));
        if (glm::intersectRaySphere(inverseEye, inverseRay, glm::vec3(0.f, 0.f, 0.f), 1, intersectionPosition,
                                    intersectionNormal)) {
            hasIntersect = true;
            realIntersectPosition = M_array[nSpheres] * glm::vec4(intersectionPosition, 1.f);
            realIntersectNormal = glm::normalize(M_array[nSpheres] * glm::vec4(intersectionNormal, 0.f));
            distances[nSpheres] = glm::length(realIntersectPosition);
        } else {
            distances[nSpheres] = 0.0f;
        }
    }

    // If ray find intersect
    if (hasIntersect) {

        // Find first sphere that intersect with ray
        bool hasClosestSphere = false;
        for (int nSpheres = 0; nSpheres < sphereVec.size(); nSpheres++) {
            if (!hasClosestSphere && distances[nSpheres] != 0.f) {
                closestSphere = nSpheres;
                hasClosestSphere = true;
            } else if (hasClosestSphere && distances[nSpheres] != 0.f &&
                       distances[closestSphere] > distances[nSpheres]) {
                closestSphere = nSpheres;
            }
        }
        inverseEye = glm::vec3(inverse_M_array[closestSphere] * glm::vec4(eye, 1.f));
        inverseRay = glm::normalize(glm::vec3(inverse_M_array[closestSphere] * glm::vec4(ray, 0.f)));
        glm::intersectRaySphere(inverseEye, inverseRay, glm::vec3(0.f, 0.f, 0.f), 1, intersectionPosition, intersectionNormal);
        realIntersectPosition = M_array[closestSphere] * glm::vec4(intersectionPosition, 1.f);
        realIntersectNormal = glm::normalize(M_array[closestSphere] * glm::vec4(intersectionNormal, 0.f));

        // Recurse
        glm::vec3 reflecRay(-2.f * glm::dot(ray, realIntersectNormal) * realIntersectNormal + ray);
        hasReflect = raytracing(realIntersectPosition, glm::normalize(reflecRay), colors, count + 1);

        // Find lights pointing intersection without blocked
        vector<light> workingLightVec;
        for (int nLights = 0; nLights < lightVec.size(); nLights++) {
            // Light and RealIntersectPosition to sphere's coordinate
            bool check = true;
            for (int nSpheres = 0; nSpheres < sphereVec.size(); nSpheres++) {
                glm::vec3 newLightPos(inverse_M_array[nSpheres] * glm::vec4(lightVec[nLights].pos, 1.f));
                glm::vec3 newRealIntersectPos(inverse_M_array[nSpheres] * glm::vec4(realIntersectPosition, 1.f));
                glm::vec3 newLightVec = glm::normalize(newLightPos - newRealIntersectPos);
                float dummy;
                // if only one sphere blocks, light won't be effective
                if (nSpheres != closestSphere && glm::intersectRaySphere(newRealIntersectPos, newLightVec, glm::vec3(0.f, 0.f, 0.f), 1, dummy)) {
                    check = false;
                    break;
                }
            }
            if (check)
                workingLightVec.push_back(lightVec[nLights]);
        }
        // First
        if (count == 1) {
            //PIXEL_COLOR[c] = Ka*Ia[c]*O[c] +
            for (int i = 0; i < 3; i++)
                *(colors + i) += sphereVec[closestSphere].K[0] * ambInten[i] * sphereVec[closestSphere].RGB[i];
            for (int nLights = 0; nLights < workingLightVec.size(); nLights++) {
                glm::vec3 inverLightPosition(inverse_M_array[closestSphere] * glm::vec4(workingLightVec[nLights].pos, 1.f));
                // for each point light (p) { Kd*Ip[c]*(N dot L)*O[c]   +   Ks*Ip[c]*(R dot V)n } + Kr*(Color returned from reflection ray)
                float angleBtwN_L = glm::dot(intersectionNormal, glm::normalize(inverLightPosition - intersectionPosition));
                if (angleBtwN_L < 0.f)
                    angleBtwN_L = 0.f;
                float angleBtwR_V = glm::dot(2.0f * (angleBtwN_L) * intersectionNormal - glm::normalize(inverLightPosition - intersectionPosition), glm::normalize(inverseEye - intersectionPosition));
                if (angleBtwR_V < 0.f)
                    angleBtwR_V = 0.f;
                for (int i = 0; i < 3; i++)
                    *(colors + i) += sphereVec[closestSphere].K[1] * workingLightVec[nLights].intesity[i] * angleBtwN_L * sphereVec[closestSphere].RGB[i]
                                     + sphereVec[closestSphere].K[2] * workingLightVec[nLights].intesity[i] * glm::pow(angleBtwR_V, sphereVec[closestSphere].specularExp);
            }
        }
        // Reflected ray (count: 2, 3)
//        else {
//            for (int nLights = 0; nLights < workingLightVec.size(); nLights++) {
//                if (hasReflect) {
//                    for (int i = 0; i < 3; i++)
//                        *(colors + i) += sphereVec[closestSphere].K[3] * workingLightVec[nLights].intesity[i] * sphereVec[closestSphere].RGB[i];
//                } else {
//                    for (int i = 0; i < 3; i++)
//                        *(colors + i) += sphereVec[closestSphere].K[3] * workingLightVec[nLights].intesity[i] * sphereVec[closestSphere].RGB[i];
//                }
//            }
//        }
    } else if (count == 1) { // ray from eye couldn't find intersection
        *colors += backCol[0];
        *(colors + 1) += backCol[1];
        *(colors + 2) += backCol[2];
    } else { // ray by reflection cound't find intersection
        *colors += 0.f;
        *(colors + 1) += 0.f;
        *(colors + 2) += 0.f;
    }
    // return whether this ray has found intersection or not
    return hasIntersect;
}
//----------------------------------------------------------------
//------------------- END RAYTRACING------------------------------
//----------------------------------------------------------------

/*
 * light intensity * K diffuse * normal dot point to source vector
 * light intensity * K specular * (right vector from point(R) dot eye vector from point) ^ shininess
 * R = 2(n dot L)n - L
*/



//----------------------------------------------------------------
//------------------CLASS PROVIDED SOURCES------------------------
//----------------------------------------------------------------
// Output in P6 format, a binary file containing:
// P6
// ncolumns nrows
// Max colour value
// colours in binary format thus unreadable
void save_imageP6(int Width, int Height, char *fname, unsigned char *pixels) {
    FILE *fp;
    const int maxVal = 255;

    printf("Saving image %s: %d x %d\n", fname, Width, Height);
    fp = fopen(fname, "wb");
    if (!fp) {
        printf("Unable to open file '%s'\n", fname);
        return;
    }
    fprintf(fp, "P6\n");
    fprintf(fp, "%d %d\n", Width, Height);
    fprintf(fp, "%d\n", maxVal);

    for (int j = 0; j < Height; j++) {
        fwrite(&pixels[j * Width * 3], 3, Width, fp);
    }
    fclose(fp);
}

/*------------------------------------------------------*/
/*
 * Invert a 4x4 matrix.  Changed slightly from Richard Carling's code
 * in "Graphics Gems I".
 */

#define SMALL_NUMBER    1.e-8

void invert_matrix(double A[4][4], double Ainv[4][4]) {
    int i, j;
    double det;

    adjoint(A, Ainv);

    det = det4x4(A);

    if (fabs(det) < SMALL_NUMBER) {
        fprintf(stderr, "invert_matrix: matrix is singular!");
        return;
    }

    for (i = 0; i < 4; i++)
        for (j = 0; j < 4; j++)
            Ainv[i][j] = Ainv[i][j] / det;
}

void adjoint(double in[4][4], double out[4][4]) {
    double a1, a2, a3, a4, b1, b2, b3, b4;
    double c1, c2, c3, c4, d1, d2, d3, d4;

    a1 = in[0][0];
    b1 = in[0][1];
    c1 = in[0][2];
    d1 = in[0][3];

    a2 = in[1][0];
    b2 = in[1][1];
    c2 = in[1][2];
    d2 = in[1][3];

    a3 = in[2][0];
    b3 = in[2][1];
    c3 = in[2][2];
    d3 = in[2][3];

    a4 = in[3][0];
    b4 = in[3][1];
    c4 = in[3][2];
    d4 = in[3][3];

    out[0][0] = det3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
    out[1][0] = -det3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
    out[2][0] = det3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
    out[3][0] = -det3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);

    out[0][1] = -det3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
    out[1][1] = det3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
    out[2][1] = -det3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
    out[3][1] = det3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);

    out[0][2] = det3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
    out[1][2] = -det3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
    out[2][2] = det3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
    out[3][2] = -det3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);

    out[0][3] = -det3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
    out[1][3] = det3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
    out[2][3] = -det3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
    out[3][3] = det3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
}

double det4x4(double m[4][4]) {
    double ans;
    double a1, a2, a3, a4, b1, b2, b3, b4, c1, c2, c3, c4, d1, d2, d3, d4;


    a1 = m[0][0];
    b1 = m[0][1];
    c1 = m[0][2];
    d1 = m[0][3];

    a2 = m[1][0];
    b2 = m[1][1];
    c2 = m[1][2];
    d2 = m[1][3];

    a3 = m[2][0];
    b3 = m[2][1];
    c3 = m[2][2];
    d3 = m[2][3];

    a4 = m[3][0];
    b4 = m[3][1];
    c4 = m[3][2];
    d4 = m[3][3];

    ans = a1 * det3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
          - b1 * det3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
          + c1 * det3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
          - d1 * det3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
    return ans;
}

//double det3x3( a1, a2, a3, b1, b2, b3, c1, c2, c3 )
//   double a1, a2, a3, b1, b2, b3, c1, c2, c3;
// a1  b1  c1
// a2  b2  c2
// a3  b3  c3
double det3x3(double a1, double a2, double a3, double b1, double b2, double b3, double c1,
              double c2, double c3) {
    double ans;

    ans = a1 * det2x2(b2, b3, c2, c3)
          - b1 * det2x2(a2, a3, c2, c3)
          + c1 * det2x2(a2, a3, b2, b3);
    return ans;
}

//double det2x2( a, b, c, d)
//   double a, b, c, d;
double det2x2(double a, double b, double c, double d) {
    double ans;
    ans = a * d - b * c;
    return ans;
}