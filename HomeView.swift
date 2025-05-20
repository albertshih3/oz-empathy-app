import SwiftUI

// MARK: - Models
struct FeaturedCard: Identifiable {
    let id = UUID()
    let image: String
    let title: String
    let description: String
    let route: String
    let colors: [Color]
}

struct ZooSection: Identifiable {
    let id = UUID()
    let name: String
    let image: String
    let route: String
    let color: Color
}

// MARK: - ThemedText
struct ThemedText: View {
    enum TextType {
        case `default`, title, defaultSemiBold, subtitle, link
    }
    
    let text: String
    let type: TextType
    var lightColor: Color?
    var darkColor: Color?
    var additionalStyle: Font.Weight? = nil
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Text(text)
            .font(font)
            .foregroundColor(textColor)
            .fontWeight(weight)
    }
    
    private var font: Font {
        switch type {
        case .default, .defaultSemiBold:
            return .system(size: 16)
        case .title:
            return .system(size: 32)
        case .subtitle:
            return .system(size: 20)
        case .link:
            return .system(size: 16)
        }
    }
    
    private var weight: Font.Weight {
        switch type {
        case .default:
            return additionalStyle ?? .regular
        case .defaultSemiBold:
            return additionalStyle ?? .semibold
        case .title:
            return additionalStyle ?? .bold
        case .subtitle:
            return additionalStyle ?? .bold
        case .link:
            return additionalStyle ?? .regular
        }
    }
    
    private var textColor: Color {
        if let customColor = colorScheme == .dark ? darkColor : lightColor {
            return customColor
        }
        
        switch type {
        case .link:
            return Color(hex: "#0a7ea4")
        default:
            return colorScheme == .dark ? Color(hex: "#ECEDEE") : Color(hex: "#11181C")
        }
    }
}

// MARK: - ThemedView
struct ThemedView<Content: View>: View {
    var lightBackgroundColor: Color?
    var darkBackgroundColor: Color?
    let content: () -> Content
    
    @Environment(\.colorScheme) private var colorScheme
    
    init(lightBackgroundColor: Color? = nil, darkBackgroundColor: Color? = nil, @ViewBuilder content: @escaping () -> Content) {
        self.lightBackgroundColor = lightBackgroundColor
        self.darkBackgroundColor = darkBackgroundColor
        self.content = content
    }
    
    var body: some View {
        content()
            .background(backgroundColor)
    }
    
    private var backgroundColor: Color {
        if let customColor = colorScheme == .dark ? darkBackgroundColor : lightBackgroundColor {
            return customColor
        }
        
        return colorScheme == .dark ? Color(hex: "#151718") : Color.white
    }
}

// MARK: - HomeView
struct HomeView: View {
    @State private var searchQuery = ""
    @State private var isDownloadingAnimals = false
    @State private var isConnected = true
    @Environment(\.colorScheme) private var colorScheme
    
    // Featured cards for the carousel
    private let featuredCards: [FeaturedCard] = [
        FeaturedCard(
            image: "home/welcome",
            title: "Welcome to the Empathy Guide",
            description: "Explore the Oakland Zoo and learn about our animals",
            route: "welcome",
            colors: [Color(hex: "#0a7ea4"), Color(hex: "#0a9ea4")]
        ),
        FeaturedCard(
            image: "home/empathy",
            title: "Learn About Empathy",
            description: "Discover why empathy matters for wildlife conservation",
            route: "learn",
            colors: [Color(hex: "#4a8f29"), Color(hex: "#6aaf49")]
        ),
        FeaturedCard(
            image: "home/resources",
            title: "Resources",
            description: "Access guides and educational materials",
            route: "resources",
            colors: [Color(hex: "#8c4bab"), Color(hex: "#ac6bcb")]
        )
    ]
    
    // Zoo sections
    private let zooSections: [ZooSection] = [
        ZooSection(
            name: "California Trail",
            image: "home/cat",
            route: "cat",
            color: Color(hex: "#0a7ea4")
        ),
        ZooSection(
            name: "African Savanna",
            image: "home/africa",
            route: "africa",
            color: Color(hex: "#e67e22")
        ),
        ZooSection(
            name: "Children's Zoo",
            image: "home/children",
            route: "cz",
            color: Color(hex: "#16a085")
        ),
        ZooSection(
            name: "Tropical Rainforest",
            image: "home/rainforest",
            route: "rainforest",
            color: Color(hex: "#27ae60")
        ),
        ZooSection(
            name: "Wild Australia",
            image: "home/train",
            route: "australia",
            color: Color(hex: "#d35400")
        )
    ]
    
    var body: some View {
        ThemedView {
            ScrollView {
                VStack(spacing: 0) {
                    // Header Section with Search
                    VStack(spacing: 8) {
                        ThemedText(text: "Oakland Zoo", type: .title, lightColor: .white, darkColor: .white)
                            .padding(.top, 50)
                        
                        ThemedText(text: "Empathy Guide", type: .default, lightColor: Color.white.opacity(0.9), darkColor: Color.white.opacity(0.9))
                            .padding(.bottom, 16)
                        
                        // Search Bar
                        HStack {
                            TextField("Search for an animal...", text: $searchQuery)
                                .padding(.horizontal, 16)
                                .frame(height: 44)
                                .background(colorScheme == .dark ? Color(hex: "#333") : Color.white)
                                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                .cornerRadius(8)
                            
                            Button(action: handleSearch) {
                                Image(systemName: "magnifyingglass")
                                    .foregroundColor(.white)
                                    .frame(width: 44, height: 44)
                                    .background(Color(hex: "#127fa2"))
                                    .cornerRadius(8)
                            }
                        }
                        .padding(.bottom, 8)
                    }
                    .padding(.horizontal, 16)
                    .background(Color(hex: "#0a7ea4"))
                    
                    // Featured Content Carousel
                    TabView {
                        ForEach(featuredCards) { card in
                            Button(action: {
                                navigateTo(card.route)
                            }) {
                                HStack {
                                    Image(card.image)
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 100, height: 100)
                                        .cornerRadius(8)
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(card.title)
                                            .font(.system(size: 18, weight: .bold))
                                            .foregroundColor(.white)
                                        
                                        Text(card.description)
                                            .font(.system(size: 14))
                                            .foregroundColor(Color.white.opacity(0.9))
                                    }
                                    .padding(.leading, 16)
                                }
                                .padding(24)
                                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                                .background(
                                    LinearGradient(
                                        gradient: Gradient(colors: card.colors),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .frame(height: 200)
                    .tabViewStyle(PageTabViewStyle())
                    .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
                    
                    // Section Title
                    VStack(alignment: .leading, spacing: 6) {
                        ThemedText(text: "Explore the Zoo", type: .subtitle)
                        
                        Rectangle()
                            .fill(Color(hex: "#0a7ea4"))
                            .frame(width: 40, height: 3)
                    }
                    .padding(.top, 24)
                    .padding(.bottom, 16)
                    .padding(.horizontal, 16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // Quick Search Button
                    Button(action: {
                        navigateTo("search")
                    }) {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.white)
                                .padding(.trailing, 8)
                            
                            Text("Search All Animals")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(16)
                        .background(Color(hex: "#0a7ea4"))
                        .cornerRadius(12)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 2)
                    
                    // Favorites Button
                    Button(action: {
                        navigateTo("favorites")
                    }) {
                        HStack {
                            Image(systemName: "heart.fill")
                                .foregroundColor(.white)
                                .padding(.trailing, 8)
                            
                            Text("View Favorites")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(16)
                        .background(Color(hex: "#e25950"))
                        .cornerRadius(12)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    
                    // Offline Data Status
                    if isDownloadingAnimals {
                        HStack {
                            ProgressView()
                                .padding(.trailing, 8)
                            
                            ThemedText(text: "Downloading animal data for offline use...", type: .default)
                        }
                        .padding(.vertical, 10)
                        .padding(.horizontal, 16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(colorScheme == .dark ? Color(hex: "#333") : Color.white)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color(hex: "#e0e0e0"), lineWidth: 1)
                        )
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                    
                    if !isConnected {
                        HStack {
                            Image(systemName: "wifi.slash")
                                .foregroundColor(Color.orange)
                                .padding(.trailing, 8)
                            
                            ThemedText(text: "You're offline. Some features may be limited.", type: .default)
                        }
                        .padding(.vertical, 10)
                        .padding(.horizontal, 16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(colorScheme == .dark ? Color(hex: "#333") : Color.white)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color(hex: "#e0e0e0"), lineWidth: 1)
                        )
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                    
                    // Zoo Sections
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        ForEach(zooSections) { section in
                            Button(action: {
                                navigateTo(section.route)
                            }) {
                                VStack {
                                    ZStack {
                                        section.color
                                        
                                        Image(section.image)
                                            .resizable()
                                            .scaledToFill()
                                    }
                                    .frame(height: 100)
                                    
                                    ThemedText(text: section.name, type: .defaultSemiBold)
                                        .padding(.vertical, 12)
                                }
                                .background(colorScheme == .dark ? Color(hex: "#2C2C2E") : Color.white)
                                .cornerRadius(12)
                                .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 30)
                }
            }
        }
        .edgesIgnoringSafeArea(.top)
    }
    
    private func handleSearch() {
        if !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            navigateTo("search", query: searchQuery)
        }
    }
    
    private func navigateTo(_ route: String, query: String? = nil) {
        // Navigation would be implemented here
        // In a real implementation, this would use NavigationStack or NavigationLink
        print("Navigating to \(route) \(query != nil ? "with query: \(query!)" : "")")
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Preview
struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            HomeView()
                .preferredColorScheme(.light)
                .previewDisplayName("Light Mode")
            
            HomeView()
                .preferredColorScheme(.dark)
                .previewDisplayName("Dark Mode")
        }
    }
}