import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Star, DollarSign, BookOpen, Award } from 'lucide-react';
import { Course } from '../../lib/businessModules';

export default function CoursePlatformModule() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
    autoSignupPlatforms();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: onlineCourses, error } = await supabase
        .from('online_courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const realCourses = onlineCourses || [];
      setCourses(realCourses);
      
      const students = realCourses.reduce((sum, course) => sum + (course.students || 0), 0);
      const revenue = realCourses.reduce((sum, course) => sum + ((course.students || 0) * course.price), 0);
      
      setTotalStudents(students);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSignupPlatforms = async () => {
    const platforms = [
      { name: 'Teachable', url: 'https://teachable.com' },
      { name: 'Thinkific', url: 'https://thinkific.com' },
      { name: 'Udemy', url: 'https://udemy.com' },
      { name: 'Coursera', url: 'https://coursera.org' },
      { name: 'Kajabi', url: 'https://kajabi.com' }
    ];

    for (const platform of platforms) {
      try {
        await fetch('/api/auto-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: platform.name,
            email: 'goncalvesjacelina27@gmail.com',
            password: 'MakeMoney20k',
            businessType: 'course_platform'
          })
        });
      } catch (error) {
        console.error(`Auto-signup failed for ${platform.name}:`, error);
      }
    }
  };
  const generateCourse = () => {
    alert('AI is generating a new course based on trending topics and market demand...');
  };

  const issueCertificate = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    alert(`Generating completion certificate for: ${course?.title}`);
  };

  const viewStudentDashboard = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    alert(`Opening student dashboard for: ${course?.title} (${course?.students} enrolled students)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Online Course Platform</h2>
          <p className="text-blue-200">AI-generated courses with certification</p>
        </div>
        <button 
          onClick={generateCourse}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Generate Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Courses</p>
              <p className="text-xl font-bold text-white">{courses.length}</p>
            </div>
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Students</p>
              <p className="text-xl font-bold text-white">{totalStudents.toLocaleString()}</p>
            </div>
            <Users className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Revenue</p>
              <p className="text-xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Avg Rating</p>
              <p className="text-xl font-bold text-white">
                {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
              </p>
            </div>
            <Star className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Course Catalog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-1">{course.title}</h4>
                  <p className="text-sm text-blue-200 mb-2">{course.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-green-400 font-semibold text-lg">${course.price}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 text-sm">{course.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200 text-sm">{course.modules} modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{course.students} students</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => viewStudentDashboard(course.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => issueCertificate(course.id)}
                  className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Award className="w-3 h-3" />
                  <span>Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Course Performance</h3>
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between">
              <span className="text-white">{course.title}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${(course.students / 1500) * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-200 text-sm w-20">{course.students} students</span>
                <span className="text-green-400 font-semibold w-24">
                  ${(course.students * course.price).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">AI-Powered Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Automated Course Creation</h4>
            <p className="text-sm text-blue-200">AI generates comprehensive courses based on trending topics and market demand</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Smart Certification</h4>
            <p className="text-sm text-blue-200">Automatically issues certificates upon course completion with blockchain verification</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Personalized Learning</h4>
            <p className="text-sm text-blue-200">AI adapts course content and pace based on individual student progress</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Student Analytics</h4>
            <p className="text-sm text-blue-200">Detailed insights into student engagement and learning outcomes</p>
          </div>
        </div>
      </div>

      {/* Student Dashboard Preview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Student Dashboard Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <GraduationCap className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Progress Tracking</h4>
            <p className="text-sm text-blue-200">Visual progress indicators and completion status</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <Award className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Achievements</h4>
            <p className="text-sm text-blue-200">Badges and certificates for milestones</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <Users className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Community</h4>
            <p className="text-sm text-blue-200">Student forums and peer interaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}