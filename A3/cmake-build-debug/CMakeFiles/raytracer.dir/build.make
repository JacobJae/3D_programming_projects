# CMAKE generated file: DO NOT EDIT!
# Generated by "MinGW Makefiles" Generator, CMake Version 3.12

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

SHELL = cmd.exe

# The CMake executable.
CMAKE_COMMAND = "C:\Program Files\JetBrains\CLion 2018.2.6\bin\cmake\win\bin\cmake.exe"

# The command to remove a file.
RM = "C:\Program Files\JetBrains\CLion 2018.2.6\bin\cmake\win\bin\cmake.exe" -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = D:\Jacob\Study\EECS\EECS3431\Assignment3\program

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = D:\Jacob\Study\EECS\EECS3431\Assignment3\program\cmake-build-debug

# Include any dependencies generated for this target.
include CMakeFiles/raytracer.dir/depend.make

# Include the progress variables for this target.
include CMakeFiles/raytracer.dir/progress.make

# Include the compile flags for this target's objects.
include CMakeFiles/raytracer.dir/flags.make

CMakeFiles/raytracer.dir/main.cpp.obj: CMakeFiles/raytracer.dir/flags.make
CMakeFiles/raytracer.dir/main.cpp.obj: ../main.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=D:\Jacob\Study\EECS\EECS3431\Assignment3\program\cmake-build-debug\CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object CMakeFiles/raytracer.dir/main.cpp.obj"
	C:\MinGW\bin\g++.exe  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles\raytracer.dir\main.cpp.obj -c D:\Jacob\Study\EECS\EECS3431\Assignment3\program\main.cpp

CMakeFiles/raytracer.dir/main.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/raytracer.dir/main.cpp.i"
	C:\MinGW\bin\g++.exe $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E D:\Jacob\Study\EECS\EECS3431\Assignment3\program\main.cpp > CMakeFiles\raytracer.dir\main.cpp.i

CMakeFiles/raytracer.dir/main.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/raytracer.dir/main.cpp.s"
	C:\MinGW\bin\g++.exe $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S D:\Jacob\Study\EECS\EECS3431\Assignment3\program\main.cpp -o CMakeFiles\raytracer.dir\main.cpp.s

# Object files for target raytracer
raytracer_OBJECTS = \
"CMakeFiles/raytracer.dir/main.cpp.obj"

# External object files for target raytracer
raytracer_EXTERNAL_OBJECTS =

raytracer.exe: CMakeFiles/raytracer.dir/main.cpp.obj
raytracer.exe: CMakeFiles/raytracer.dir/build.make
raytracer.exe: CMakeFiles/raytracer.dir/linklibs.rsp
raytracer.exe: CMakeFiles/raytracer.dir/objects1.rsp
raytracer.exe: CMakeFiles/raytracer.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=D:\Jacob\Study\EECS\EECS3431\Assignment3\program\cmake-build-debug\CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable raytracer.exe"
	$(CMAKE_COMMAND) -E cmake_link_script CMakeFiles\raytracer.dir\link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
CMakeFiles/raytracer.dir/build: raytracer.exe

.PHONY : CMakeFiles/raytracer.dir/build

CMakeFiles/raytracer.dir/clean:
	$(CMAKE_COMMAND) -P CMakeFiles\raytracer.dir\cmake_clean.cmake
.PHONY : CMakeFiles/raytracer.dir/clean

CMakeFiles/raytracer.dir/depend:
	$(CMAKE_COMMAND) -E cmake_depends "MinGW Makefiles" D:\Jacob\Study\EECS\EECS3431\Assignment3\program D:\Jacob\Study\EECS\EECS3431\Assignment3\program D:\Jacob\Study\EECS\EECS3431\Assignment3\program\cmake-build-debug D:\Jacob\Study\EECS\EECS3431\Assignment3\program\cmake-build-debug D:\Jacob\Study\EECS\EECS3431\Assignment3\program\cmake-build-debug\CMakeFiles\raytracer.dir\DependInfo.cmake --color=$(COLOR)
.PHONY : CMakeFiles/raytracer.dir/depend

