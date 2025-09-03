import React from 'react';

const AnalyticsPlaceholders: React.FC = () => {
  const placeholderSections = [
    {
      title: 'Article Performance Analytics',
      description: 'Detailed breakdown of how students perform on individual articles and specific fragments.',
      features: ['Fragment difficulty analysis', 'Completion rate trends', 'Common error patterns', 'Time-to-completion metrics'],
      icon: '📈'
    },
    {
      title: 'Individual Student Reports',
      description: 'Comprehensive per-student analytics with learning progression and personalized insights.',
      features: ['Progress timeline', 'Skill development tracking', 'Personalized recommendations', 'Detailed session history'],
      icon: '👤'
    },
    {
      title: 'Export & Reporting',
      description: 'Export class and individual student data for external analysis and reporting.',
      features: ['CSV/PDF exports', 'Custom date ranges', 'Grade book integration', 'Parent/admin reports'],
      icon: '📊'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {placeholderSections.map((section, index) => (
            <div
              key={index}
              className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center"
            >
              <div className="text-4xl mb-4 opacity-50">{section.icon}</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {section.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {section.description}
              </p>
              <ul className="text-left text-xs text-gray-500 space-y-1">
                {section.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <span className="inline-flex px-3 py-1 bg-gray-200 text-gray-500 text-xs rounded-full">
                  In Development
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlaceholders;
