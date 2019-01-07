cmake_minimum_required(VERSION 3.12)
project(program)

set(CMAKE_CXX_STANDARD 14)

add_executable(raytracer main.cpp)

target_link_libraries(raytracer)