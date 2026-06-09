import React from 'react';
import 'react-range-slider-input/dist/style.css';
import './ScooterSpecFilter.css';

const TABS = [
  { key: 'maxSpeed', label: 'Tốc độ', unit: 'km/h' },
  { key: 'range', label: 'Quãng đường', unit: 'km' },
  { key: 'motorPower', label: 'Công suất', unit: 'W' },
  { key: 'weight', label: 'Trọng lượng', unit: 'kg' },
  { key: 'battery', label: 'Pin', unit: '' },
  { key: 'wheelLoad', label: 'Bánh & Tải', unit: '' },
  { key: 'incline', label: 'Độ dốc', unit: '' },
];

const PRESETS = {
  maxSpeed: [
    { label: '≤ 25 km/h', value: 25, desc: 'Phù hợp đi trong phố' },
    { label: '35 - 45 km/h', value: 40, desc: 'Cân bằng giữa tốc độ và an toàn' },
    { label: '≥ 50 km/h', value: 50, desc: 'Di chuyển nhanh, cần bằng lái tốt' },
  ],
  range: [
    { label: '≥ 30 km', value: 30, desc: 'Phù hợp di chuyển ngắn' },
    { label: '50 - 70 km', value: 50, desc: 'Đủ cho hầu hết nhu cầu hàng ngày' },
    { label: '≥ 80 km', value: 80, desc: 'Di chuyển xa, ít sạc' },
  ],
  motorPower: [
    { label: '≤ 350W', value: 350, desc: 'Tiết kiệm pin, nhẹ' },
    { label: '500 - 800W', value: 800, desc: 'Công suất trung bình' },
    { label: '≥ 1000W', value: 1000, desc: 'Mạnh mẽ, leo dốc tốt' },
  ],
  weight: [
    { label: '≤ 15 kg', value: 15, desc: 'Nhẹ, dễ mang lên xe bus/tàu' },
    { label: '15 - 25 kg', value: 25, desc: 'Cân bằng giữa tính di động và ổn định' },
    { label: '> 25 kg', value: 30, desc: 'Nặng hơn nhưng ổn định hơn' },
  ],
  battery: [
    { label: 'Pin rời được', value: 'removable', desc: 'Dễ sạc, có thể mang pin vào nhà', type: 'bool' },
    { label: '≥ 15Ah', value: 15, desc: 'Dung lượng lớn, đi xa hơn', type: 'number' },
    { label: '≥ 48V', value: 48, desc: 'Điện áp cao, mạnh mẽ hơn', type: 'number' },
  ],
  wheelLoad: [
    { label: '≤ 10 inch', value: 10, desc: 'Bánh nhỏ, linh hoạt trong phố' },
    { label: '≥ 11 inch', value: 11, desc: 'Bánh lớn, êm hơn trên đường xấu' },
    { label: 'Tải trọng ≥ 120kg', value: 120, desc: 'Phù hợp người nặng hoặc mang đồ nhiều' },
  ],
  incline: [
    { label: '≤ 15%', value: 15, desc: 'Địa hình phẳng, đường city' },
    { label: '15 - 25%', value: 25, desc: 'Leo dốc vừa, đường đồi nhẹ' },
    { label: '≥ 25%', value: 25, desc: 'Leo dốc cao, đường núi' },
  ],
};

const TabButton = ({ tab, active, onClick }) => (
  <button
    type="button"
    className={`scooter-spec-tab ${active ? 'is-active' : ''}`}
    onClick={onClick}
  >
    {tab.label}
  </button>
);

const PresetChip = ({ preset, selected, onClick }) => (
  <button
    type="button"
    className={`scooter-spec-preset ${selected ? 'is-selected' : ''}`}
    onClick={onClick}
  >
    <span className="scooter-spec-preset__label">{preset.label}</span>
    <span className="scooter-spec-preset__desc">{preset.desc}</span>
  </button>
);

const ScooterSpecFilter = ({ specFilters, onSpecFilterChange, activeTab, onTabChange }) => {
  const handleTabChange = (key) => {
    onTabChange(key);
  };

  const handlePresetClick = (tabKey, presetValue) => {
    const currentVal = specFilters?.[tabKey] || null;
    const newVal = currentVal === presetValue ? null : presetValue;
    onSpecFilterChange({ ...specFilters, [tabKey]: newVal });
  };

  const activeTabData = TABS.find((t) => t.key === activeTab);
  const presets = PRESETS[activeTab] || [];
  const selectedPresetValue = specFilters?.[activeTab] || null;

  const hints = {
    maxSpeed: 'Bạn cần tốc độ tối đa bao nhiêu?',
    range: 'Quãng đường di chuyển trung bình mỗi ngày?',
    motorPower: 'Bạn cần công suất motor ở mức nào?',
    weight: 'Bạn có cần mang xe lên xe buýt hoặc cất trong nhà?',
    battery: 'Pin có những tính năng quan trọng nào?',
    wheelLoad: 'Kích thước bánh và tải trọng phù hợp với bạn?',
    incline: 'Bạn thường đi trên địa hình nào?',
  };

  return (
    <div className="scooter-spec-filter">
      <div className="scooter-spec-filter__tabs">
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            active={activeTab === tab.key}
            onClick={() => handleTabChange(tab.key)}
          />
        ))}
      </div>

      {activeTabData && (
        <div className="scooter-spec-filter__content">
          <p className="scooter-spec-filter__hint">
            {hints[activeTab]}
          </p>
          <div className="scooter-spec-filter__presets">
            {presets.map((preset) => (
              <PresetChip
                key={preset.value}
                preset={preset}
                selected={selectedPresetValue === preset.value}
                onClick={() => handlePresetClick(activeTab, preset.value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScooterSpecFilter;
