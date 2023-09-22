import { configureCharts } from '../components/chart/configure'
import { configureDarkThemeToggle } from '../components/navbar/configureDarkThemeToggle'
import { configureSidebarMenu } from '../components/navbar/configureSidebarMenu'
import { configureCanonicalBridgesFilter } from './configureCanonicalBridgesFilter'
import { configureDropdowns } from './configureDropdowns'
import { configureExpandableContainer } from './configureExpandableContainer'
import { configureFloatingBanner } from './configureFloatingBanner'
import { configureHoverableDropdown } from './configureHoverableDropdown'
import { configureProjectFilters } from './configureProjectFilters'
import { configureRosetteOverlay } from './configureRosetteOverlay'
import { configureSelects } from './configureSelects'
import { configureSlideCards } from './configureSlideCard'
import { configureTableIndexRerender } from './configureTableIndexRerender'
import { configureTabs } from './configureTabs'
import { configureTooltips } from './configureTooltips'
import { configureTopBars } from './configureTopBars'
import { configureUpgradeDescriptions } from './configureUpgradeDescriptions'
import { configureProjectNavigation } from './section-navigation'

configureDarkThemeToggle()
configureSidebarMenu()
configureTooltips()
configureCharts()
configureDropdowns()
configureSlideCards()
configureRosetteOverlay()
configureFloatingBanner()
configureHoverableDropdown()
configureProjectNavigation()
configureExpandableContainer()
configureTabs()
configureCanonicalBridgesFilter()
configureTableIndexRerender()
configureUpgradeDescriptions()
configureTopBars()
configureProjectFilters()
configureSelects()
